// 以下信息仅在 >= 1.0版本内显示，后续1.0版本发布后（应为第一个可用的稳定版）将删除并重新开始记录changelog


待定功能:

- [ ] 技能石一键合成
- [ ] 梦幻宝石快速合成
- [ ] 技能石一键爆破
- [ ] 因子关卡通用信息获取
- [ ] 重新梳理Functions与mods的定位
- [ ] 使用UIUtils工具获取鼠标点击处的UI对象
- [ ] 合并计数物品获得(解决start receive问题)
- [ ] 异步命令事件总线，通知命令执行情况，全局提示框取代bubble
- [ ] 点空白处不关闭主面板的锁定
- [ ] tsc不要检查node_modules
- [ ] 抓包区排序，选择删除，序号，以及调试发包
- [ ] 全局状态栏
- [ ] data加载为全局config的provide，而后通过对中间件进行rfc，完成配置的读写与序列化/反序列化
- [ ] 数据源与订阅源模块
- [ ] react层次重构,优化react部分代码组织

- [ ] 快捷命令组模块
  - [ ] 自定义编辑代码并eval
  - [ ] 模块CloseAll
- [ ] 新的模块加载管理器，可以监听模块的首次加载，后续重加载，并方便的获取panel等对象
- [ ] 通用的模块加载器和获取器的封装，以便在ts环境下可以方便的获取模块全局实例，以及对模块的特定监听与加载/卸载操作等

- [ ] 在缓存中读取部分配置

RoadMap: `12.23-1.15` 

- [ ] 一键日常
  - [x] 经验/学习力/塔
  - [x] 泰坦矿洞(采矿稳定性待测试)
  - [x] x密室
  - [ ] 精灵王
  - [ ] 神王殿
  - [ ] 作战实验室
  - [ ] 扫荡与配置
  - [ ] 杂项与签到


- [ ] 适配新背包的精灵状态更新(LocalCloth)
  - [ ] usePetPotion的配套更新回调 // 参考cureAll
  - [ ] setPetPosition的的配套更新回调 // initBagView
- [ ] 取消使用道具的确认


v0.3.0
1. 全新的**一键日任面板**
2. 取消使用道具的确认
3. 适配新背包的精灵状态更新
4. 精灵背包dump

v0.2.11
1. 精灵背包面板
2. 战斗管理器面板

v0.2.10
1. 点空白处关闭主面板
2. 个人信息获取与修改相关api，见`player-helper`
3. 友谊之星查看

v0.2.9 **break changes**
1. `SkillModule`更名为`MoveModule`，更好的反映这个函数是作用于一轮内的操作，而不只是出招逻辑
2. `BaseSkillModule`模块现在为`Strategy`模块
3. 相关类型现在在`AutoBattle`命名空间下
4. 重构整个`BattleModuleManager`:
   1. 将无关的输出显示逻辑移入`EventHandler`
   2. 将进入战斗与战斗逻辑两个部分解耦，战斗逻辑可以在无进入战斗的情况下单独设定。战斗逻辑调度部分为`BattleModuleManager.strategy`
   3. 不再使用队列，战斗状态管理权的将交给模组编写者，Manager仅提供一次性的`runOnce`作为方便函数，封装了一个在战斗结束时resolve的promise
5. `Functions` & `PetHelper`下函数命名已统一为*camelCase*
6. 优化`Functions`模块下`lowerBlood`代码逻辑，修正背包切换的bug，适配新的`BattleManager`
7. 修复初始化部分的`Event`模块因为将`SAEventTarget`捕获为模块内变量导致hmr更新时不能更新相关事件回调的bug
8. `Utils`添加GetBitSet功能，该函数用以取一系列布尔值，类似GetMultiValue,只不过后者的取值范围为为正整数
9. `PetHelper`下现在可以获取自动治疗状态
10. `LocalCloth`: 现在只有点击精灵头像时会输出调试信息了

v0.2.8
1. 将抓包逻辑迁移到ui组件中（部分功能未实现）

v0.2.7
1. 全局面板现在会在关闭后隐藏而不是卸载
2. 抓包功能支持
3. 更新socket部分定义
4. 更新wrapper函数签名,this参数类型现在由调用者手动指定而不是依赖typescript推导

v0.2.6
1. 常用数据查看模块
2. 引入egret的TypeDefined
3. 更新定义文件
4. 优化项目组织结构

v0.2.5
1. 后台挂机功能，通过在lifecycle处于pause期间定时发送system_time_check包实现

v0.2.4
1. 更新定义文件
2. 将模块外部逻辑，即两个`loader`放入`src/`下
3. ~~`entity`下`__type`现在为static~~更正: `__type`按设计为实例属性

v0.2.3.5
1. 更新部分定义文件
2. `LocalCloth`模块适配新版背包点击头像查看精灵详情

v0.2.3.4
1. 更新部分定义文件
2. ~~PetHelper.getPets()~~ 弃用: `PetHelper`模块下的`getPets`方法已根据官方更新精灵仓库和背包系统后的情况拆分为`getBagPets`和`getStoragePets`两个函数。对于后者，不会立即返回所有精灵的信息，而是返回一个异步函数，执行后得到`Pet`实体的Promise(即延迟加载，只在要访问的时候获取某个精灵的信息)。
> ps:由于`calcAllEfficientPet`函数使用的仅为精灵属性，且实现没用到`getPets`方法，所有不受影响

v0.2.3.3
1. ctrl+p自动给命令框对上焦点
2. 本地皮肤的战斗部分不修改到对方皮肤

v0.2.3.2
1. 添加样式化的主功能按钮(打开主功能页面)
2. 优化快捷功能条的逻辑
3. 更换快捷功能条单的样式
4. 优化组件的文件组织
5. 优化组件的页面布局

v0.2.3.1
1. 命令框优化，全局显示完成的命令，输入更加自然
2. 在模组命令底部添加return命令，目前退出模组命令输入有两种方式
   1. 选择使用return命令
   2. 在输入框为空时按下`Backspace`

v0.2.3
1. 全局`ctrl+p`命令框，带自动提示。
2. 模组添加内省方法，可以获取方法名和通过方法名执行相应方法。
3. 修复命令框在不显示的时候没有卸载的问题(顺便解决初始化的时候mods还未载入导致的初始化异常)

v0.2.2.3
1. 添加路径别名，修改导入自定义data的方式
2. 添加了计划使用的本地api接口，方便SA未来可以进行日志保存和信息的保存等

v0.2.2.2
1. 修复压血在不需要进入战斗直接退出后不能正确进行补药的问题
2. 关于某些精灵原皮的half图加载失败：官方的assets配置里就不完整，缺失了很多精灵half的hash，无法修复

v0.2.2.1
1. 小优化
2. 主页现在会将入口点暴露，同时删除了百度统计的注入

v0.2.2
1. 红莲安卡第四关mod
2. 圣瞳缪斯第四关mod
3. 修复一个在BattleModule对象中没有使用箭头函数导致的this指向错误问题（x密室mod）

v0.2.1

1. 修复`Utils`模块中`DictMatcher`的错误
2. 添加了更多的物品常量
3. `BattleModule.Operator`可以使用auto函数进行自动操作
4. 现在`SocketSendByQueue`返回`undefined | ArrayBuffer`，以便进行收包的读取

v0.2.0

**break changes**：详见0.1.8 - 0.2.0的changelogs

(更新过渡版本 v0.1.11):

1. 迁移工作收尾，为大部分mods添加了any注解，方便过渡
2. 添加`utils\module`模块，目前只是部分方便的helper方法，方便在ts环境下获取全局加载的module对象
3. archive的模组不再显示，并且排除出仓库。（这部分模组都是作者写的过渡用或自用模组，针对性较强，且不会影响模块的核心功能，等日后开放外部模组sdk后，会挑选合适的地点发布自定义模组。而且注意，现阶段的official mods是这个项目的不完善与作者需求的矛盾之下的产物。）
4. 添加调试用的logger模块
5. 修复了mod中获取全局对象的错误
6. 修复了`LocalCloth`模组中对于原皮肤id为undefined的处理不当导致的错误
7. 修复了官方获取部分精灵经典皮肤的banner会失败的问题

(v0.2.0):

1. 更新了ts下的hmr（重构时移除了这个功能），现在hmr可以正常工作，包括react-refresh/动态替换全局导出/模块更新
2. 重新组织了所有的模块的目录，使之更符合现代js library的组织方式（但目前仍然只有web构建）

v0.1.10
1. 继续迁移工作，大部分代码已经迁移到typescript
2. 修复一个由于对象浅拷贝导致的对局信息获取错误
3. `SAEventManager`已更名为`SAEventTarget`
4. `BattleModule`模块大型翻修，已添加完善的声明与定义
5. `BattleModule.BattleModuleManager`模块下`BattleModule`现在不是分别传入`entry`,`skillModule`,`finish`，而是一个包含这三个属性的对象

v0.1.9

1. 继续迁移工作, 项目已配置typescript环境
2. 考虑到所有的官方js文件的注入口已经被拦截，所以进行了全局的`console`替换，因此现在项目可以正常使用原生console（而不是对全局的console进行代理）并不破坏堆栈信息
3. 修复压血功能的问题

v0.1.8

1. 项目进行整体大重构，下面是重点摘要
2. `sa-loader`现在会加载init目录下的初始化文件，这些文件都具有全局副作用
3. `event`模块整体重做，对原函数的hook全部移动到init下的`event.js`内完成，现在的思路是`SAEventManager`只负责接收hook挂载的时候传出的值
4. `common`模块移动到根目录下，命名为`utils.js`，在全局作用域挂载`wrapper`和`delay`
5. 新增`globals.d.ts`用于vsc全局变量提示
6. `const`下`CMDID`现在值是从`CommandID`中读取的
7. `entities`模块大更改，更加统一，通用。其他模块将使用新的对象进行数据交互
8. `PetHelper`重新整合，修改Promise逻辑，修改导入导出
9. 修复大量bug

v0.1.7

1. `setPetLocation`适配新版背包，适配部分的逻辑如下：
   1. `PosType`为`storage`的情况下，如果当前位置是精英收藏，则将精灵移除精英，否则等同于点击“放入仓库”。即自动根据是否为精英，放入仓库对应位置
   2. `PosType`为`elite`的情况下，尝试将精灵加入精英收藏，并且会首先回收至仓库。
   3. `PosType`为`bag1/secondbag1`的情况下，等同于在仓库的对应位置点击“放入背包”
   4. 如果觉得有点绕，可以这样理解，`setPetLocation`会自动根据精灵的当前位置，执行等同新版背包在当前位置的相应操作。如果当前页面不能执行这种操作（跨界面转移），则会分两步执行（如情况2）。
2. `getPetLocation`与`getPets`代码无变动，获取精英收藏的行为和版本一致：即使出战也能在`elite`类别下获取到。
3. `LocalCloth`模组添加小功能：在背包界面点击头像在控制台输出相应的原生PetInfo对象，方便调试
4. 考虑到目前还没有UI界面，暂时没有针对因子关做太多适配功能
5. 光惩关卡archive

v0.1.6.1

1. 修复初版通用战斗模块的小bug
2. 其他小优化

v0.1.6

1. `Utils`模块新增精灵查询
2. `Functions`模块新增多余刻印分解
3. 新的功能：**本地全皮肤**
4. 现在可以监听模块的打开和首次加载了
5. 战队派遣之前自动收取之前派遣
6. 更改了common模块的导出位置，现在位于`Utils`下

v0.1.5

1. 较多的修复和优化，详见commit中的文件diff
2. 红莲安卡模型：添加千裳强攻灰羽苍兽，以及在战斗模型匹配失败后交还控制权
3. 添加了新的模组：x战队，英卡洛斯飞镰点灯，莫伊莱因子
4. 刻印一键5级，可以在游戏内UI界面直接操作(较不稳定)
5. 一键清除多余的泰坦刻印

v0.1.4

1. 红莲安卡模型继续优化: 神鹿仙子关使用圣谱，为避免翻车提醒月照要三孔或特攻珠
2. 每日签到新增vip礼包和点数
3. loader适配8.12版本的sentry关闭
4. `Functions`新增切换vip自动回血
5. 重大优化：使用promise包装cmd监听回调，现在可以通过`SocketReceivedPromise`函数来包装某会发包的操作，该函数返回一个Promise，收包之后才resolve。
6. 使用`SocketReceivedPromise`优化`setPetLocation`，现在可以直接`await setPetLocation`，不需要再手动delay了。同时也变相加快了该函数的执行效率。
7. 现在将私人数据常量导入common.config.js中，约定通过`import data from '../common.config.js'`来访问
8. 精灵位置常量已封装进`Const`模块，约定通过`const PosType = Const.PETPOS`来访问

v0.1.3

1. 修复压血cts为空时没有运行callback的问题
2. 持续优化红莲安卡第三关模组，为了减少miss的问题使用了朵潘来进行场地必中，有待进一步观察效果
3. 英卡洛斯关卡已通过，archive
4. 光之惩戒收收集能量已通过，archive
5. 压血新判断极端情况，若谱尼被击败还未压血完成则运行下一个压血

v0.1.2

1. 重构过滤无用调试信息的方式，不再使用wrapper包装输出调试信息的函数，而是使用Proxy来代理console.log和warn。注意：通过这种方式必须通过trace才能得到调用链，因此待办：在模组内部使用封装后的Logger函数而不是代理后的console。
2. 优化确认信息显示，现在会以气泡方式显示而不是完全在控制台输出
3. 以原生接口开启发包调试输出
4. 优化socket信息显示
5. 修复压血func传入空数组也会触发战斗的问题
6. 优化红莲安卡模型
7. 英卡洛斯自动eve
8. 新功能：自动战队派遣，带自定义排除项，操作方式是将要排除的精灵放进背包

v0.1.1

1. 红莲安卡第三关模型优化，优化调试信息显示
2. 添加英卡洛斯平衡能量模型
3. 重构名称匹配技能模型，现在会根据添加的顺序匹配，并且会判断pp
4. 修复BattleOperator.UseSkill中传入无效id时自动使用技能错误（注意id和当前精灵不匹配会被显示非法操作的警告信息，BattleOperator不负责id的正确性校验，请使用调试完毕确认无误的模型或者传入前使用校验函数）

v0.1.0

第一个预览版本