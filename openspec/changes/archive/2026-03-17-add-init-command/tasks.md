## 1. Command Handler Implementation

- [x] 1.1 Create `src/commands/init.ts` with `handleInit` function skeleton
- [x] 1.2 Implement config file existence check with overwrite prompt
- [x] 1.3 Implement default config display with "Customize?" prompt
- [x] 1.4 Implement interactive customization flow (storePath, LLM provider/model, defaultTopic)
- [x] 1.5 Implement config file creation using `saveConfigToFile`
- [x] 1.6 Implement directory creation using `ensureDirectories`
- [x] 1.7 Implement database initialization using `initDatabase`
- [x] 1.8 Implement success/error reporting with colored output

## 2. Command Registration

- [x] 2.1 Add `init` command to `src/commands/index.ts`
- [x] 2.2 Add `--global` option flag to init command

## 3. Testing

- [x] 3.1 Create `src/__tests__/init.test.ts`
- [x] 3.2 Test local init with defaults accepted
- [x] 3.3 Test local init with customization
- [x] 3.4 Test global init (--global flag)
- [x] 3.5 Test overwrite prompt when config exists
- [x] 3.6 Test error handling (permission denied, etc.)

## 4. Documentation

- [x] 4.1 Update README.md with `memo init` usage examples
- [x] 4.2 Update README.md Quick Start section to include init command