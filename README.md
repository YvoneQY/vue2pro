# vue2pro

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


git checkout -b test

本地创建分支推送到远程仓库中

git push -u origin test



git log可以查看提交过的版本信
而got reflog可以查看所有分支的操作记录，包含已经被删除的commit记录。

然后git reset --hard  版本号 回滚到某版本

1.本地创建分支并切换分支
git checkout -b develop
2. 将develop分支推送到远程
git push origin develop:develop
3. 建立本地至上游（远程）分支的链接，这样代码才能提交到远程
git branch --set-upstream-to=orgin/develop
4.取消对develop分支的跟踪
(需要取消跟踪时才操作)

git branch --unset-upstream develop

PS F:\linhanbaiyu\vue2pro> git branch -vv
* develop e9b5c7e Merge branch 'test'
  master  e9b5c7e [origin/master: ahead 2] Merge branch 'test'
  test    8c9944d [origin/test] app.vue


  git branch -u origin/master//将当前分支跟踪origin/master
Branch 'master' set up to track remote branch 'master' from 'origin'.

https://www.jianshu.com/p/36202c29e6ae