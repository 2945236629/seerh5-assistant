import { Button, Dialog, DialogActions, Divider, TableCell, TableRow, Typography } from '@mui/material';
import { SAContext } from '@sa-app/context/SAContext';
import { useCore } from '@sa-app/provider/useCore';
import { mainColor } from '@sa-app/style';
import React from 'react';
import { PanelTableBase } from '../base';
import { LevelCourageTower } from './LevelCourageTower';
import { LevelElfKingsTrial } from './LevelElfKingsTrial';
import { LevelExpTraining } from './LevelExpTraining';
import { LevelStudyTraining } from './LevelStudyTraining';
import { LevelTitanHole } from './LevelTitanHole';
import { LevelXTeamRoom } from './LevelXTeamRoom';

const { Battle, Utils } = useCore();
interface Level {
    name: string;
    module: JSX.Element;
    sweep?(): Promise<void>;
    getState(): Promise<boolean>;
}

export function Realm() {
    const [open, setOpen] = React.useState(false);
    const [running, setRunning] = React.useState(false);
    const [taskModule, setTaskModule] = React.useState<null | number>(null);
    const [taskCompleted, setTaskCompleted] = React.useState<Array<boolean>>([]);

    const { Battle: battleContext } = React.useContext(SAContext);
    const [battleAuto, setBattleAuto] = [battleContext.enableAuto, battleContext.updateAuto];

    let taskModuleComponent = <></>;

    const closeHandler = () => {
        if (battleContext.enableAuto) {
            Battle.Manager.triggerLocker = undefined;
            Battle.Manager.strategy = undefined;
            setBattleAuto(false);
        }
        setRunning(false);
        setOpen(false);
    };

    const rows: Array<Level> = [
        {
            name: '经验训练场',
            module: <LevelExpTraining setRunning={setRunning} running={running} />,
            async getState() {
                return (await Utils.GetBitSet(1000571))[0];
            },
        },
        {
            name: '学习力训练场',
            module: <LevelStudyTraining setRunning={setRunning} running={running} />,
            async getState() {
                return (await Utils.GetBitSet(1000572))[0];
            },
        },
        {
            name: '勇者之塔',
            module: <LevelCourageTower setRunning={setRunning} running={running} />,
            async getState() {
                return (await Utils.GetBitSet(1000577))[0];
            },
        },
        {
            name: '泰坦矿洞',
            module: <LevelTitanHole setRunning={setRunning} running={running} />,
            async sweep() {
                await Utils.SocketSendByQueue(42395, [104, 6, 3, 0]);
            },
            async getState() {
                const [count, step] = await Utils.GetMultiValue(18724, 18725);
                return count === 2 && step === 0;
            },
        },
        {
            name: '精灵王试炼',
            module: <LevelElfKingsTrial setRunning={setRunning} running={running} />,
            async getState() {
                const [count, weeklyCount] = await Utils.GetMultiValue(18745, 20134);
                const [rewardClosed] = await Utils.GetBitSet(2000037);
                return count === 15 || (weeklyCount >= 100 && rewardClosed);
            },
        },
        {
            name: 'x战队密室',
            module: <LevelXTeamRoom setRunning={setRunning} running={running} />,
            async getState() {
                return (await Utils.GetBitSet(1000585, 2000036)).some(Boolean);
            },
        },
        // { name: '作战实验室'
        // { name: '六界神王殿'
    ];

    React.useEffect(() => {
        Promise.all(rows.map((level) => level.getState())).then((r) => setTaskCompleted(r));
    }, [open, taskModule, running]);

    if (taskModule != null) {
        taskModuleComponent = rows[taskModule].module;
    }

    return (
        <>
            <Button>一键日任</Button>
            <Divider />
            <PanelTableBase
                size="small"
                aria-label="realm table"
                heads={
                    <>
                        <TableCell align="center">关卡名称</TableCell>
                        <TableCell align="center">完成状态</TableCell>
                        <TableCell align="left">操作</TableCell>
                        <TableCell align="center">配置</TableCell>
                    </>
                }
            >
                {rows.map((row, index) => (
                    <TableRow
                        key={index}
                        sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                            backgroundColor: taskCompleted[index] ? `rgba(${mainColor.front}/ 18%)` : 'transparent',
                        }}
                    >
                        <TableCell component="th" scope="row" align="center">
                            {row.name}
                        </TableCell>
                        <TableCell align="center">
                            <Typography color={taskCompleted[index] ? '#eeff41' : 'inherited'}>
                                {taskCompleted[index] ? '已完成' : '未完成'}
                            </Typography>
                        </TableCell>
                        <TableCell align="left">
                            <Button
                                onClick={() => {
                                    setTaskModule(index);
                                    setOpen(true);
                                }}
                            >
                                启动
                            </Button>
                            {row.sweep && (
                                <Button
                                    onClick={() => {
                                        row.sweep!()
                                            .then(() => row.getState())
                                            .then((r) => {
                                                taskCompleted[index] = r;
                                                setTaskCompleted([...taskCompleted]);
                                            });
                                    }}
                                >
                                    扫荡
                                </Button>
                            )}
                        </TableCell>
                        <TableCell align="center"></TableCell>
                    </TableRow>
                ))}
            </PanelTableBase>
            <Dialog
                open={open}
                sx={{
                    '& .MuiDialog-paper': {
                        minWidth: 384,
                        bgcolor: `rgba(${mainColor.front} / 18%)`,
                        backdropFilter: 'blur(4px)',
                    },
                }}
            >
                {taskModuleComponent}
                <DialogActions>
                    {/* {actions} */}
                    <Button onClick={closeHandler}>{battleAuto ? '终止' : '退出'}</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
