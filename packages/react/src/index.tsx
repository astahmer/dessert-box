import {
  AtomsFnBase,
  composeClassNames,
  extractAtomsFromProps,
  PropValue,
} from '@dessert-box/core';
import React, {
  createContext,
  createElement,
  ForwardedRef,
  forwardRef,
  ReactElement,
  useContext,
} from 'react';
import type { CreateBoxParams } from './types';

// adapted from https://github.com/kripod/react-polymorphic-box
type AsProp<TType extends React.ElementType = React.ElementType> = {
  as?: TType;
};
type BaseBoxProps<TType extends React.ElementType> = AsProp<TType> &
  Omit<React.ComponentProps<TType>, keyof AsProp>;

type PolymorphicComponentProps<TType extends React.ElementType, Props> = Props &
  BaseBoxProps<TType>;

type PolymorphicComponent<
  Props,
  DefaultType extends React.ElementType = 'div',
> = <TType extends React.ElementType = DefaultType>(
  props: PolymorphicComponentProps<TType, Props>,
) => React.ReactElement | null;
//

type OverrideTokens<T> = {
  [K in keyof T as K extends string ? `__${K}` : number]:
    | Extract<T[K], string | number>
    | {};
};

type Tokens<AtomsFn extends AtomsFnBase> = Parameters<AtomsFn>[0];
type BoxProps<
  AtomsFn extends AtomsFnBase,
  TType extends React.ElementType,
> = PolymorphicComponentProps<
  TType,
  Tokens<AtomsFn> & OverrideTokens<Tokens<AtomsFn>>
>;

const createUsedStylesMap = () => {
  const props = new Map<string, { [conditionName: string]: Set<PropValue> }>();
  const classNames = new Set<string>();

  return { props, classNames };
};

const UsedStylesContext = createContext<
  undefined | ReturnType<typeof createUsedStylesMap>
>(undefined);

// idea from https://github.com/styled-components/styled-components-website/blob/61538c27f4076253a5c6d94ffc9940a0cf1d4aee/sections/advanced/server-side-rendering.md
export const createStylesCollector = () => {
  const usedStylesMap = createUsedStylesMap();

  return {
    getUsedStyles: () => usedStylesMap,
    collect: (app: ReactElement) => (
      <UsedStylesContext.Provider value={usedStylesMap}>
        {app}
      </UsedStylesContext.Provider>
    ),
  };
};

const defaultElement = 'div';
export function createBox<AtomsFn extends AtomsFnBase>({
  atoms: atomsFn,
  defaultClassName,
}: CreateBoxParams<AtomsFn>) {
  const Box: <TType extends React.ElementType = typeof defaultElement>(
    props: BoxProps<AtomsFn, TType>,
  ) => null | ReactElement<BoxProps<AtomsFn, TType>> = forwardRef(
    <TType extends React.ElementType = typeof defaultElement>(
      { className, style, ...props }: BoxProps<AtomsFn, TType>,
      ref: ForwardedRef<PolymorphicComponent<BoxProps<AtomsFn, TType>, TType>>,
    ) => {
      const Element = props.as || defaultElement;
      const { atomProps, customProps, otherProps, hasAtomProps } =
        extractAtomsFromProps(props, atomsFn);

      const sprinkleClassname = atomsFn(atomProps);
      console.log({ sprinkleClassname });
      const ctx = useContext(UsedStylesContext);

      if (hasAtomProps && ctx) {
        ctx.classNames.add(sprinkleClassname);

        Object.entries(atomProps).forEach(([key, sprinklePropValue]) => {
          if (!sprinklePropValue) return;
          const props = ctx.props;

          if (!props.has(key)) {
            props.set(key, { default: new Set() });
          }

          const propStyles = props.get(key)!;
          if (typeof sprinklePropValue === 'object') {
            Object.entries(sprinklePropValue).forEach(
              ([conditionName, conditionValue]) => {
                if (!propStyles[conditionName]) {
                  propStyles[conditionName] = new Set();
                }
                propStyles[conditionName].add(conditionValue);
              },
            );
          } else if (Array.isArray(sprinklePropValue)) {
            sprinklePropValue.forEach((value) => propStyles.default.add(value));
          } else {
            propStyles.default.add(sprinklePropValue);
          }
        });
      }

      return createElement(Element, {
        ref,
        style: { ...style, ...customProps },
        ...otherProps,
        className: composeClassNames(
          className,
          sprinkleClassname,
          defaultClassName,
        ),
      });
    },
  );

  (Box as any).displayName = 'DessertBox';

  return Box;
}

type BoxWithAtomsProps<
  AtomsFn extends AtomsFnBase,
  TType extends React.ElementType,
> = PolymorphicComponentProps<
  TType,
  { atoms?: Tokens<AtomsFn> & OverrideTokens<Tokens<AtomsFn>> }
>;

export function createBoxWithAtomsProp<AtomsFn extends AtomsFnBase>({
  atoms: atomsFn,
  defaultClassName,
}: CreateBoxParams<AtomsFn>) {
  const Box: <TType extends React.ElementType = typeof defaultElement>(
    props: BoxWithAtomsProps<AtomsFn, TType>,
  ) => null | ReactElement = forwardRef(
    <TType extends React.ElementType = typeof defaultElement>(
      { className, style, atoms, ...props }: BoxWithAtomsProps<AtomsFn, TType>,
      ref: ForwardedRef<
        PolymorphicComponent<BoxWithAtomsProps<AtomsFn, TType>, TType>
      >,
    ) => {
      const Element = props.as || defaultElement;

      return createElement(Element, {
        ref,
        ...props,
        className: composeClassNames(
          className,
          atomsFn(atoms),
          defaultClassName,
        ),
      });
    },
  );

  (Box as any).displayName = 'DessertBox';

  return Box;
}
