1. **重构文档** - 更新 README.md 、README_CN.md和 SKILL.md，确保与当前功能一致
2. **更新 package.json** - 递增 version（遵循 semver），更新 description 与功能匹配
3. **提交并发布** - git add/commit/push 到 GitHub，然后 `clawhub publish` 发布到 ClawHub

## ClawHub 发布命令

```bash
clawhub publish /Users/ogenes/Data/www/jimeng --slug jimeng--name "Jimeng AI" --version <新版本号> --changelog "<变更说明>"
```