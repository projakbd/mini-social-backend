import morgan from 'morgan';

const logger = morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined');

export default logger;
