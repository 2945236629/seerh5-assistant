import { useMainState } from '@/context/useMainState';
import { Button, Paper, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { produce } from 'immer';
import React, { useEffect, useRef, useState } from 'react';
import { BattleFireType, Engine, SEAEventSource, Subscription } from 'sea-core';

type BattleFireInfo = Awaited<ReturnType<typeof Engine.updateBattleFireInfo>>;

const timeFormatter = (n: number) => {
    const { format } = Intl.NumberFormat(undefined, {
        minimumIntegerDigits: 2,
    });
    return `${format(Math.trunc(n / 60))}:${format(n % 60)}`;
};

const { setInterval } = window;

export function BattleFire() {
    const [battleFire, setBattleFire] = useState<BattleFireInfo>({ valid: false, timeLeft: 0 } as BattleFireInfo);
    const timer = useRef<null | number>(null);

    const update = async () => {
        const i = await Engine.updateBattleFireInfo();

        setBattleFire(i);
        if (!i.valid || i.timeLeft <= 0) return;
        if (timer.current) clearInterval(timer.current);

        timer.current = setInterval(() => {
            setBattleFire(
                produce((draft) => {
                    if (draft.timeLeft > 0) {
                        draft.timeLeft -= 1;
                    } else {
                        draft.valid = false;
                        if (timer.current) {
                            clearInterval(timer.current);
                            timer.current = null;
                        }
                    }
                })
            );
        }, 1000);
    };
    
    useEffect(() => {
        update();
        const sub = new Subscription();
        sub.on(SEAEventSource.egret('battleFireUpdateInfo'), update);
        return () => {
            sub.dispose();
        };
    }, []);

    let renderProps: { color: string; text: string };
    const { timeLeft } = battleFire;
    if (battleFire.valid) {
        switch (battleFire.type) {
            case BattleFireType.绿火:
                renderProps = { color: 'green', text: `绿火 ${timeFormatter(timeLeft)}` };
                break;
            case BattleFireType.金火:
                renderProps = { color: 'gold', text: `金火 ${timeFormatter(timeLeft)}` };
                break;
            default:
                renderProps = { color: 'inherit', text: '其他火焰' };
                break;
        }
    } else {
        renderProps = { color: 'inherit', text: '无火焰' };
    }

    const { setOpen } = useMainState();
    const exchangeBattleFire = React.useCallback(() => {
        ModuleManager.showModule('battleFirePanel', ['battleFirePanel'], null, null, AppDoStyle.NULL);
        setOpen(false);
    }, [setOpen]);

    return (
        <Paper sx={{ p: 4, height: '100%', flexDirection: 'column', alignItems: 'baseline' }}>
            <Typography fontWeight="bold" fontFamily={['Noto Sans SC', 'sans-serif']}>
                火焰信息
            </Typography>
            <Stack flexDirection="row" alignItems="center" justifyContent="space-between" width={'100%'}>
                <Typography color={renderProps.color}>{renderProps.text}</Typography>
                <Button onClick={exchangeBattleFire}>兑换</Button>
            </Stack>
        </Paper>
    );
}
