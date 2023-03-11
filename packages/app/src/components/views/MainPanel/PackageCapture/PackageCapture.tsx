import { Button, TableCell, Toolbar } from '@mui/material';
import * as React from 'react';
import { wrapper } from 'seerh5-assistant-core';
import { PanelTableBase, PanelTableBodyRow } from '../base';

interface CapturedPackage {
    type: 'RemoveListener' | 'AddListener' | 'Received' | 'Send';
    time: string;
    cmd: number;
    label: string;
    data?: Array<number | DataView> | DataView | Function;
}

type State = 'pending' | 'capturing';

const timeFormat = Intl.DateTimeFormat('zh-cn', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

const wrapperFactory = <T extends 'addCmdListener' | 'removeCmdListener' | 'dispatchCmd' | 'send'>(
    funcName: T,
    decorator?: (...args: Parameters<typeof SocketConnection.mainSocket[T]>) => any
) => {
    const thisObj = SocketConnection.mainSocket;
    if (decorator) {
        let func = thisObj[funcName];
        (thisObj[funcName] as any) = wrapper(func.bind(thisObj), undefined, (r, ...args) =>
            decorator.call(null, ...args)
        );
    } else {
        thisObj[funcName] = (thisObj[funcName] as any).rawFunction;
    }
};

const capturedPkgFactory = (
    c: CapturedPackage[],
    update: React.Dispatch<React.SetStateAction<CapturedPackage[]>>,
    originalPack: Pick<CapturedPackage, 'cmd' | 'data' | 'type'>
) => {
    update([
        ...c,
        {
            ...originalPack,
            time: timeFormat.format(new Date()),
            label: SocketEncryptImpl.getCmdLabel(originalPack.cmd),
        },
    ]);
};

const cmdFilter: number[] = [
    1002, // SYSTEM_TIME
    2001, // ENTER_MAP
    2002, // LEAVE_MAP
    2004, // MAP_OGRE_LIST
    2441, // LOAD_PERCENT
    9019, // NONO_FOLLOW_OR_HOOM
    9274, //PET_GET_LEVEL_UP_EXP
    41228, // SYSTEM_TIME_CHECK
];
// SocketConnection.mainSocket.filterCMDLog(1001, 1002, 1016, 2001, 2002, 2441, 9019, 41228, 42387);

// clear() {
//     this.captureList.splice(0);
// }

// dump() {
//     console.table(this.captureList);
// }

// dumpListener() {
//     for (const [k, v] of this.listenerList.entries()) {
//         if (v.length > 0) {
//             console.log(`${k} : ${SocketEncryptImpl.getCmdLabel(k)}`);
//             console.table(v);
//         }
//     }
// }

export function PackageCapture() {
    const [state, setState] = React.useState<State>('pending');
    const [capture, setCapture] = React.useState<CapturedPackage[]>([]);

    const [getLabel, _] = React.useState<typeof SocketEncryptImpl.getCmdLabel>(() => SocketEncryptImpl.getCmdLabel);

    React.useEffect(() => {
        wrapperFactory('addCmdListener', (cmd, callback) => {
            if (state !== 'capturing' || cmdFilter.includes(cmd)) return;
            capturedPkgFactory(capture, setCapture, { cmd, type: 'AddListener', data: callback });
        });

        wrapperFactory('removeCmdListener', (cmd, callback) => {
            if (state !== 'capturing' || cmdFilter.includes(cmd)) return;
            capturedPkgFactory(capture, setCapture, { cmd, type: 'RemoveListener', data: callback });
        });

        wrapperFactory('dispatchCmd', (cmd, head, buf) => {
            if (state !== 'capturing' || cmdFilter.includes(cmd)) return;
            capturedPkgFactory(capture, setCapture, { cmd, data: buf?.dataView, type: 'Received' });
        });

        wrapperFactory('send', (cmd, data) => {
            if (state !== 'capturing' || cmdFilter.includes(cmd)) return;
            capturedPkgFactory(capture, setCapture, {
                cmd,
                data: data.flat().map((v) => (v instanceof egret.ByteArray ? v.dataView : v)),
                type: 'Send',
            });
        });

        return () => {
            wrapperFactory('addCmdListener');
            wrapperFactory('removeCmdListener');
            wrapperFactory('dispatchCmd');
            wrapperFactory('send');
        };
    }, [state, capture]);

    return (
        <>
            <Toolbar>
                <Button
                    onClick={() => {
                        if (state === 'capturing') {
                            setState('pending');
                        } else if (state === 'pending') {
                            setState('capturing');
                        }
                    }}
                >
                    {state === 'capturing' ? '停止' : state === 'pending' ? '监听' : ''}
                </Button>
                <Button>清除</Button>
                <Button
                    onClick={() => {
                        setCapture([]);
                    }}
                >
                    全部清除
                </Button>
                <Button>筛选器</Button>
                <Button
                    onClick={() => {
                        console.table(capture);
                    }}
                >
                    一键dump
                </Button>
            </Toolbar>

            <PanelTableBase
                size="small"
                aria-label="capture package table"
                heads={
                    <>
                        <TableCell align="center">时间</TableCell>
                        <TableCell align="center">类型</TableCell>
                        <TableCell align="center">命令ID</TableCell>
                        <TableCell align="center">命令名</TableCell>
                        <TableCell align="center">操作</TableCell>
                    </>
                }
            >
                {capture.map((row, index) => (
                    <PanelTableBodyRow key={index}>
                        <TableCell component="th" scope="row" align="center">
                            {row.time}
                        </TableCell>
                        <TableCell align="center">{row.type}</TableCell>
                        <TableCell align="center">{row.cmd}</TableCell>
                        <TableCell align="center" sx={{ fontFamily: 'Roboto, Helvetica', fontSize: '0.9rem', p: 0 }}>
                            {row.label}
                        </TableCell>
                        <TableCell align="center">
                            <Button
                                onClick={() => {
                                    console.log(row);
                                }}
                            >
                                dump
                            </Button>
                            <Button
                                onClick={() => {
                                    if (row.type === 'Send') {
                                        let data = row.data as Array<number | DataView>;
                                        SocketConnection.mainSocket.send(
                                            row.cmd,
                                            data.map((v) => (typeof v === 'object' ? new egret.ByteArray(v.buffer) : v))
                                        );
                                    }
                                }}
                            >
                                重放
                            </Button>
                        </TableCell>
                    </PanelTableBodyRow>
                ))}
            </PanelTableBase>
        </>
    );
}
