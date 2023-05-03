import { createLogger } from 'bunyamin';

const logger = createLogger({
  name: 'e2e:esm',
  streams: [

  ],
});

logger.info('Hello, world!');
