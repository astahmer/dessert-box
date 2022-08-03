export interface AtomsFnBase {
  (...args: any): string;
  properties: Set<string>;
}

export function composeClassNames(...classNames: Array<string | undefined>) {
  const classes = classNames
    .filter((className) => {
      return Boolean(className) && className !== ' ';
    })
    .map((className) => {
      return className?.toString().trim();
    }) as Array<string>;
  return classes.length === 0 ? undefined : classes.join(' ');
}

export function extractAtomsFromProps<AtomsFn extends AtomsFnBase>(
  props: any,
  atomsFn: AtomsFn,
) {
  let hasAtomProps = false;
  let atomProps: Record<string, unknown> = {};
  let otherProps: Record<string, unknown> = {};
  let customProps: Record<string, unknown> = {};

  for (const key in props) {
    // console.log(key, props, typeof props[key],props[key] )
    if (key[0] === '_' && key[1] === '_') {
      const actualKey = key.substring(2);
      customProps[actualKey] = props[key];
    } else if (atomsFn.properties.has(key)) {
      hasAtomProps = true;
      atomProps[key] = props[key];
    } else if (key[0] === '_' && (typeof props[key] !== null && typeof props[key] === "object") &&  Object.keys((props)[key]).some((prop => atomsFn.properties.has(prop) || atomsFn.properties.has(prop.substring(2)) ) )) {
      hasAtomProps = true;
      Object.keys((props)[key]).forEach(prop => {
        const conditionName = key.substring(1);
        const conditionsMap = props[key];
        const  propValue =props[key][prop];

        console.log({props, key, prop, condition: conditionName, conditionMap: conditionsMap, propValue })
        if (prop[0] === '_' && prop[1] === '_') {
        const actualPropName = prop.startsWith("__") ? prop.substring(2) : prop;
        console.log({ actualPropName, actualValue: conditionsMap[prop] })

          // console.log('oui', props[key.substring(2)], props[key.substring(2)])
          customProps[actualPropName] = { ...customProps[actualPropName], [conditionName]: propValue}
        } else {
          atomProps[prop] = { ...atomProps[prop], [conditionName]: propValue}
        }
      })
    }
    else {
      otherProps[key] = props[key];
    }
  }

  return { hasAtomProps, atomProps, otherProps, customProps };
}
