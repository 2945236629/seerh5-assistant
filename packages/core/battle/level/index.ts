import { delay } from '../../common/utils.js';
import { engine } from '../../internal/index.js';
import { spet } from '../../pet-helper/index.js';
import { manager } from '../manager.js';
import type { LevelRunner } from './types.js';

export const LevelAction = {
    BATTLE: 'battle' as const,
    AWARD: 'award' as const,
    STOP: 'stop' as const
};

class LevelManager {
    private runner: LevelRunner | null = null;
    lock: Promise<void> | null = null;

    get running() {
        return this.runner != null;
    }

    /** 获取当前正在运行的Runner */
    getRunner(): LevelRunner | null {
        return this.runner;
    }

    async stop() {
        if (!this.runner) return;
        this.runner = null;
        try {
            await this.lock;
        } catch (e) {
            throw new Error(`关卡运行失败: ${e as string}`);
        } finally {
            this.lock = null;
            manager.clear();
        }
    }

    run(runner: LevelRunner) {
        if (this.running) throw new Error('你必须先停止当前Runner的运行!');

        this.runner = runner;
        const { logger } = runner;

        const lockFn = async () => {
            const autoCureState = await engine.autoCureState();

            const battle = async () => {
                const levelBattle = runner.selectLevelBattle?.();
                if (!levelBattle) {
                    throw new Error('获取对战模型失败');
                }

                const { strategy, pets, beforeBattle } = levelBattle;

                logger('准备对战');
                await engine.switchBag(pets);

                void engine.toggleAutoCure(false);
                engine.cureAllPet();

                await delay(100);

                logger('执行beforeBattle');
                await beforeBattle?.();
                await spet(pets[0]).default();

                logger('进入对战');
                try {
                    if (!this.runner) throw new Error('关卡已停止运行');

                    await manager.takeover(() => {
                        if (!runner.actions['battle']) throw new Error('未指定战斗动作');
                        void runner.actions['battle'].call(runner);
                    }, strategy);

                    logger('对战完成');
                } catch (error) {
                    this.runner = null;
                    logger(`接管对战失败: ${error as string}`);
                }

                manager.clear();
            };

            while (this.runner) {
                logger('更新关卡信息');
                await runner.update();
                const nextAction = runner.next();
                logger(`next action: ${nextAction}`);
                switch (nextAction) {
                    case LevelAction.BATTLE:
                        await battle();
                        break;
                    case LevelAction.STOP:
                        if (runner.actions['stop']) {
                            await runner.actions['stop'].call(runner);
                        }
                        this.runner = null;
                        break;
                    default:
                        await runner.actions[nextAction]?.call(runner);
                        break;
                }
                await delay(100);
            }
            logger('正在停止关卡');
            // 恢复自动治疗状态
            await engine.toggleAutoCure(autoCureState);
            engine.cureAllPet();
            await delay(200);

            logger('关卡完成');
            this.lock = this.runner = null;
        };

        this.lock = lockFn();
    }
}

export const levelManager = new LevelManager();
