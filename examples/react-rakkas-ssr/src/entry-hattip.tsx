import { createStylesCollector } from '@dessert-box/react';
import { createRequestHandler } from 'rakkasjs';
import { extractor } from './css-extractor';

// adapted from https://github.com/rakkasjs/rakkasjs/blob/45b8c7be3d21ffd3c5401b54ad60dbd4bc16f872/examples/styled-components/src/entry-hattip.tsx

export default createRequestHandler({
  createPageHooks(ctx) {
    const collector = createStylesCollector();

    return {
      wrapApp(app) {
        return collector.collect(app);
      },

      emitToDocumentHead() {
        console.log('emitToDocumentHead', collector.getUsedStyles());
        const used = collector.getUsedStyles();
        const maps = extractor.get();
        // TODO emit critical css ?
        return '';
      },
      //   https://github.com/theKashey/used-styles#interleaved-stream-rendering ?
      //   wrapSsrStream
    };
  },
});
