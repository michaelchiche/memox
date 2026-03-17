## 1. Command Handler Implementation

- [ ] 1.1 Create `src/commands/init.ts` with `handleInit` function skeleton
- [ ] 1.2 Implement config file existence check with overwrite prompt
- [ ] 1.3 Implement default config display with "Customize?" prompt
- [ ] 1.4 Implement interactive customization flow (storePath, LLM provider/model, defaultTopic)
- [ ] 1.5 Implement config file creation using `saveConfigToFile`
- [ ] 1.6 Implement directory creation using `ensureDirectories`
- [ ] 1.7 Implement database initialization using `initDatabase`
- [ ] 1.8 Implement success/error reporting with colored output

## 2. Command Registration

- [ ] 2.1 Add `init` command to `src/commands/index.ts`
- [ ] 2.2 Add `--global` option flag to init command

## 3. Testing

- [ ] 3.1 Create `src/__tests__/init.test.ts`
- [ ] 3.2 Test local init with defaults accepted
- [ ] 3.3 Test local init with customization
- [ ] 3.4 Test global init (--global flag)
- [ ] 3.5 Test overwrite prompt when config exists
- [ ] 3.6 Test error handling (permission denied, etc.)

## 4. Documentation

- [ ] 4.1 Update README.md with `memo init` usage examples
- [ ] 4.2 Update README.md Quick Start section to include init command