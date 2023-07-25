import {
    PetFragmentLevelDifficulty as Difficulty,
    ILevelBattleStrategy,
    SALevelState,
    SaModuleLogger,
    defaultStyle,
    delay,
} from 'sa-core';

import { Button, CircularProgress, Dialog, DialogActions, Divider, Typography, alpha } from '@mui/material';
import { SAContext } from '@sa-app/context/SAContext';
import type { PetFragmentOption } from '@sa-app/service/endpoints';
import React, { useCallback, useState } from 'react';
import * as SABattle from 'sa-core/battle';
import * as SAEngine from 'sa-core/engine';
import { IPFLevelBoss, IPetFragmentLevelObject, PetFragmentLevel } from 'sa-core/entity';
import type { ILevelRunner, SALevelData, SALevelInfo } from 'sa-core/level';
import { PanelColumns, PanelTable } from '../components/PanelTable/PanelTable';

import { loadBattle } from '@sa-app/service/ModManager';
import { saTheme } from '@sa-app/style';

const log = SaModuleLogger('精灵因子', defaultStyle.mod);

declare namespace pvePetYinzi {
    const DataManager: unknown;
}

interface LevelInfo extends SALevelInfo, IPetFragmentLevelObject {
    designId: number;
}

interface LevelData extends SALevelData {
    pieces: number;
    failedTimes: number;
    curDifficulty: Difficulty;
    curPosition: number;
    isChallenge: boolean;
    bosses: IPFLevelBoss[];
}

export interface Option {
    id: number;
    difficulty: Difficulty;
    sweep: boolean;
    battle: ILevelBattleStrategy[];
}

const loadOption = async (option: PetFragmentOption) => {
    return { ...option, battle: await Promise.all(option.battle.map((n) => loadBattle(n))) } as Option;
};

export class PetFragmentRunner implements ILevelRunner<LevelData, LevelInfo> {
    data: LevelData;
    info: LevelInfo;
    option: Option;
    logger: (msg: React.ReactNode) => void;

    constructor(option: Option) {
        this.option = option;
        this.option.battle = this.option.battle.map((strategy) => {
            const beforeBattle = async () => {
                await delay(Math.round(Math.random() * 1000) + 5000);
                return strategy.beforeBattle?.();
            };
            return { ...strategy, beforeBattle };
        });

        const LevelObj: SAType.PetFragmentLevelObj = config.xml
            .getAnyRes('new_super_design')
            .Root.Design.find((r: SAType.PetFragmentLevelObj) => r.ID === option.id);

        const level = new PetFragmentLevel(LevelObj);

        this.info = {
            ...level,
            designId: level.id,
            maxTimes: level.totalTimes,
        };
        this.data = { success: false } as LevelData;

        this.logger = SaModuleLogger(`精灵因子-${this.info.name}`, defaultStyle.mod);
    }

    selectBattle() {
        return this.option.battle.at(this.data.curPosition)!;
    }

    async updater() {
        const { info: config, data } = this;
        const values = await SAEngine.Socket.multiValue(
            config.values.openTimes,
            config.values.failTimes,
            config.values.progress
        );

        data.pieces = await SAEngine.getItemNum(this.info.petFragmentItem);

        data.leftTimes = this.info.maxTimes - values[0];
        data.failedTimes = values[1];
        data.curDifficulty = (values[2] >> 8) & 255;
        if (data.curDifficulty === Difficulty.NotSelected && this.option.difficulty) {
            data.curDifficulty = this.option.difficulty;
        }
        data.curPosition = values[2] >> 16;
        data.isChallenge = data.curDifficulty !== 0 && data.curPosition !== 0;
        switch (data.curDifficulty) {
            case Difficulty.Ease:
                data.bosses = config.level.ease;
                break;
            case Difficulty.Normal:
                data.bosses = config.level.ease;
                break;
            case Difficulty.Hard:
                data.bosses = config.level.ease;
                break;
            default:
                break;
        }
        this.data = { ...this.data };

        if (data.isChallenge || data.leftTimes > 0) {
            if (this.option.sweep) {
                return 'sweep' as unknown as SALevelState;
            } else {
                return SALevelState.BATTLE;
            }
        } else {
            this.data.success = true;
            return SALevelState.STOP;
        }
    }

    readonly actions: Record<string, () => Promise<void>> = {
        sweep: async () => {
            await SAEngine.Socket.sendByQueue(41283, [this.info.designId, 4 + this.data.curDifficulty]);
            this.logger('执行一次扫荡');
        },
        battle: async () => {
            const checkData = await SAEngine.Socket.sendByQueue(41284, [this.info.designId, this.data.curDifficulty]);
            const check = new DataView(checkData!).getUint32(0);
            if (check === 0) {
                SAEngine.Socket.sendByQueue(41282, [this.info.designId, this.data.curDifficulty]);
            } else {
                const err = `出战情况不合法: ${check}`;
                BubblerManager.getInstance().showText(err);
                throw new Error(err);
            }
        },
    };

    openPanel() {
        ModuleManager.showModuleByID(151, `{Design:${this.info.designId}}`);
    }
}

function logDataByName(factorName: string) {
    const data = config.xml
        .getAnyRes('new_super_design')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .Root.Design.find((r: any) => (r.Desc as string).match(factorName));
    log(data);
}

function getCurPanelInfo() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    log((pvePetYinzi.DataManager as any)._instance.curYinziData);
}

import { PanelField, useIndex, useRowData } from '@sa-app/components/PanelTable';
import { SaTableRow } from '@sa-app/components/styled/TableRow';
import * as SAEndpoint from '@sa-app/service/endpoints';
import useSWR from 'swr';
import { LevelBaseNew } from './LevelBaseNew';

import { LevelDaSheng } from './LevelDaSheng';

export function PetFragmentLevelPanel() {
    const [runner, setRunner] = useState<null | PetFragmentRunner>(null);
    const [taskCompleted, setTaskCompleted] = React.useState<Array<boolean>>([]);

    const { Battle: battleContext } = React.useContext(SAContext);
    const [battleAuto, setBattleAuto] = [battleContext.enableAuto, battleContext.updateAuto];
    const open = Boolean(runner);

    const closeHandler = () => {
        if (battleContext.enableAuto) {
            SABattle.Manager.clear();
            setBattleAuto(false);
        }
        setRunner(null);
    };

    const { data: levelRunners } = useSWR('ds://sa/level/petFragment', async () => {
        const allConfig = await SAEndpoint.getPetFragmentConfig();
        const options = await Promise.all(allConfig.map(loadOption));
        return options.map((option) => new PetFragmentRunner(option)).concat(new LevelDaSheng());
    });

    const rows: Array<PetFragmentRunner> = React.useMemo(() => levelRunners ?? [], [levelRunners]);

    React.useEffect(() => {
        Promise.all(rows.map((level) => level.updater())).then((r) => {
            setTaskCompleted(r.map((state) => Boolean(SALevelState.STOP === state)));
        });
    }, [rows]);

    const col: PanelColumns = React.useMemo(
        () => [
            {
                field: 'name',
                columnName: '关卡名称',
            },
            {
                field: 'state',
                columnName: '完成状态',
            },
            {
                field: 'action',
                columnName: '操作',
            },
            {
                field: 'config',
                columnName: '配置',
            },
        ],
        []
    );

    const toRowKey = useCallback((row: PetFragmentRunner) => row.info.name, []);

    if (!levelRunners)
        return (
            <Typography>
                加载数据中
                <CircularProgress />
            </Typography>
        );

    return (
        <>
            <Button>一键日任</Button>
            <Divider />
            <PanelTable
                data={rows}
                toRowKey={toRowKey}
                columns={col}
                rowElement={<PanelRow taskCompleted={taskCompleted} setRunner={setRunner} />}
            />
            <Dialog
                open={open}
                sx={{
                    '& .MuiBackdrop-root': {
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    },
                    '& .MuiDialog-paper': {
                        minWidth: 384,
                    },
                }}
            >
                <LevelBaseNew runner={runner} />
                <DialogActions>
                    {/* {actions} */}
                    <Button onClick={closeHandler}>{battleAuto ? '终止' : '退出'}</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

interface PanelRowProps {
    taskCompleted: boolean[];
    setRunner: React.Dispatch<React.SetStateAction<PetFragmentRunner | null>>;
}

const PanelRow = React.memo(({ taskCompleted, setRunner }: PanelRowProps) => {
    const runner = useRowData<PetFragmentRunner>();
    const index = useIndex();
    const completed = taskCompleted[index];

    return (
        <SaTableRow
            sx={{
                backgroundColor: completed ? `${alpha(saTheme.palette.primary.main, 0.18)}` : 'transparent',
            }}
        >
            <PanelField field="name">{runner.info.name}</PanelField>
            <PanelField field="state">
                <Typography color={completed ? '#eeff41' : 'inherited'}>{completed ? '已完成' : '未完成'}</Typography>
            </PanelField>
            <PanelField field="action" sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Typography>扫荡: {runner.option.sweep ? '开启' : '关闭'}</Typography>
                <Button
                    onClick={() => {
                        setRunner(runner);
                    }}
                >
                    启动
                </Button>
            </PanelField>
        </SaTableRow>
    );
});