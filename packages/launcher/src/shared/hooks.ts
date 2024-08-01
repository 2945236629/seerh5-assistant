import type { PopoverProps } from '@mui/material';
import { useCallback, useMemo, useRef, useState, type MouseEventHandler } from 'react';

export function useListDerivedValue<TKey, TCache>(data: TKey[], fn: (data: TKey, index: number) => TCache) {
    const valueRef = useRef(new Map<TKey, TCache>());
    const fnCache = useRef(fn);

    if (fnCache.current !== fn) {
        fnCache.current = fn;
        valueRef.current.clear();
        data.forEach((data, index) => {
            valueRef.current.set(data, fnCache.current?.(data, index));
        });
    } else {
        data.forEach((data, index) => {
            if (!valueRef.current.has(data)) {
                valueRef.current.set(data, fnCache.current?.(data, index));
            }
        });

        // 删除不存在的元素
        valueRef.current.forEach((_, k) => {
            if (!data.includes(k)) {
                valueRef.current.delete(k);
            }
        });
    }
    return valueRef;
}

export function usePopupState({
    popupId,
    onClose,
    onOpen
}: {
    popupId?: string;
    onClose?: () => void;
    onOpen?: () => void | Promise<void>;
}) {
    const [anchorEl, setAnchorEl] = useState<Element | null>(null);
    const handleClose = useCallback(() => {
        onClose?.();
        setAnchorEl(null);
    }, [onClose]);

    const popupState: Pick<PopoverProps, 'id' | 'open' | 'anchorEl' | 'onClose'> = {
        anchorEl,
        id: popupId,
        open: Boolean(anchorEl),
        onClose: handleClose
    };

    const open: MouseEventHandler = useCallback(
        async (event) => {
            const target = event.currentTarget;
            await onOpen?.();
            setAnchorEl(target);
        },
        [onOpen]
    );

    return { state: popupState, open, close: handleClose };
}
