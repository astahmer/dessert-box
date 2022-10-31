import type { FileScope } from '@vanilla-extract/css';
import { removeAdapter, setAdapter } from '@vanilla-extract/css/adapter';
import { transformCss } from '@vanilla-extract/css/transformCss';

type CSSObj = any;

function stringifyFileScope({ packageName, filePath }: FileScope): string {
  return packageName ? `${filePath}$$$${packageName}` : filePath;
}

// adapted from https://github.dev/seek-oss/crackle/blob/7a916b4a4dd9e70051bc514271bbc28ed9886b97/packages/core/entries/render/css-extractor.ts#L20

const createVanillaExtractor = () => {
  const bufferedCSSObjs = new Map<string, Array<CSSObj>>();
  const cssByFileScope = new Map<string, string>();
  const localClassNames = new Set<string>();
  const composedClassLists = new Array<any>();
  const usedCompositions = new Set<string>();

  return {
    get: () => ({
      bufferedCSSObjs,
      cssByFileScope,
      localClassNames,
      composedClassLists,
      usedCompositions,
    }),
    remove: () => removeAdapter(),
    set: () => {
      setAdapter({
        appendCss: (cssObj, fileScope) => {
          //   console.log({ cssObj, fileScope });
          const fileScopeKey = stringifyFileScope(fileScope);
          let fileScopeCss = bufferedCSSObjs.get(fileScopeKey);

          if (!fileScopeCss) {
            fileScopeCss = [];
            bufferedCSSObjs.set(fileScopeKey, fileScopeCss);
          }

          fileScopeCss.push(cssObj);
        },
        registerClassName: (className) => {
          //   console.log({ className });
          localClassNames.add(className);
        },
        registerComposition: (composition) => {
          //   console.log({ composition });
          composedClassLists.push(composition);
        },
        markCompositionUsed: (className) => {
          //   console.log({ className });
          usedCompositions.add(className);
        },
        getIdentOption: () => 'debug',
        onEndFileScope: (fileScope) => {
          //   console.log({ fileScope });
          const fileScopeKey = stringifyFileScope(fileScope);
          const cssObjs = bufferedCSSObjs.get(fileScopeKey);

          const css = cssObjs
            ? transformCss({
                localClassNames: Array.from(localClassNames),
                composedClassLists,
                cssObjs,
              }).join('\n')
            : '';

          cssByFileScope.set(fileScopeKey, css);

          bufferedCSSObjs.set(fileScopeKey, []);
        },
      });
    },
  };
};
export const extractor = createVanillaExtractor();
extractor.set();
