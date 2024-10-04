module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    setupFilesAfterEnv: ['<rootDir>/jest.config.js'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
};
