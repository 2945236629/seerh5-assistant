import type { AnyFunction, LevelBattle } from '@sea/core';
import { LevelAction, delay, socket } from '@sea/core';
import type { LevelData, LevelMeta } from '@sea/mod-type';
import { task } from '@sea/mod-type';

export interface Data extends LevelData {
    stimulation: boolean;
    levelOpen: boolean;
    levelOpenCount: number;
    step: number;
    step2Count: number;
    step3Count: number;
}

export interface Meta extends LevelMeta {
    step2MaxCount: number;
    step3MaxCount: number;
}

export default (logger: AnyFunction, battle: (name: string) => LevelBattle) =>
    task({
        meta: {
            id: 'LevelTitanHole',
            name: '泰坦矿洞',
            maxTimes: 2,
            step2MaxCount: 6,
            step3MaxCount: 48
        } as Meta,
        configSchema: {
            stimulation: {
                name: '泰坦矿洞双倍',
                type: 'checkbox',
                default: false
            },
            sweep: {
                name: '泰坦矿洞扫荡',
                type: 'checkbox',
                default: false
            }
        },
        runner: (meta, options) => ({
            data: {
                stimulation: false,
                levelOpen: false,
                levelOpenCount: 0,
                step: 0,
                step2Count: 0,
                step3Count: 0
            } as Data,
            logger,
            async update() {
                const bits = await socket.bitSet(640);
                const values = await socket.multiValue(18724, 18725, 18726, 18727);

                this.data.stimulation = bits[0];

                this.data.levelOpenCount = values[0];
                this.data.step = (values[1] >> 8) & 255;
                this.data.levelOpen = this.data.step > 0;
                this.data.step2Count = (values[2] >> 8) & 255;
                this.data.step3Count = values[3] & 255;
            },
            next() {
                if (this.data.levelOpenCount < meta.maxTimes || this.data.levelOpen) {
                    if (!this.data.levelOpen) {
                        return options.sweep ? 'sweep' : 'open_level';
                    } else if (this.data.step === 3) {
                        return 'mine_ores';
                    }
                    return LevelAction.BATTLE;
                } else if (this.data.levelOpenCount === meta.maxTimes) {
                    return LevelAction.STOP;
                } else {
                    return LevelAction.AWARD;
                }
            },
            selectLevelBattle() {
                if (this.data.step === 2) {
                    return battle('LevelTitanHole_1');
                } else {
                    return battle('LevelTitanHole');
                }
            },
            actions: {
                async mine_ores() {
                    if (this.data.step3Count < 48) {
                        const i = this.data.step3Count + 1;
                        // eslint-disable-next-line prefer-const
                        let [row, col] = [Math.trunc(i / 11), (i % 11) + 1];
                        if (row % 2 === 1) {
                            col = 11 - col + 1;
                        }
                        this.logger('dig', row, col, row * 11 + col);

                        // may throw error
                        await socket.sendByQueue(42395, [104, 2, row * 11 + col, 0]);

                        await delay(Math.random() * 100 + 200);
                    }
                },
                async battle() {
                    await socket.sendByQueue(42396, [104, 3, this.data.step]);
                },
                async award() {
                    await socket.sendByQueue(42395, [104, 5, 0, 0]);
                },
                async open_level() {
                    this.logger('开启泰坦矿洞');
                    await socket.sendByQueue(42395, [104, 1, 3, 0]);
                },
                async sweep() {
                    // TODO
                }
            }
        })
    });
