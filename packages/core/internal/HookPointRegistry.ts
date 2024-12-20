import type { Subscription } from 'rxjs';
import { Observable, Subject } from 'rxjs';
import { getLogger } from '../common/logger.js';
import { IS_DEV, type AnyFunction, type ValueOf } from '../common/utils.js';
import type { HookPointDataMap } from '../constant/TypeMaps.js';

const logger = getLogger('HookPointRegistry');

interface DataSteam<TEvents extends object> {
    type: keyof TEvents;
    data: ValueOf<TEvents>;
}

type VoidResolver = (data?: undefined) => void;
type DataResolver<T> = (data: T) => void;

type HookResolver<T extends ValueOf<HookPointDataMap>> = T extends undefined
    ? ((resolve: VoidResolver) => AnyFunction) | ((resolve: VoidResolver) => void)
    : ((resolve: DataResolver<T>) => AnyFunction) | ((resolve: DataResolver<T>) => void);

type HookEventData = DataSteam<HookPointDataMap>;

const hookDataSubscriptionMap = new Map<string, Subscription>();

export const HookPointRegistry = {
    subject$: new Subject<HookEventData>(),

    register<T extends keyof HookPointDataMap>(name: T, hookResolver: HookResolver<HookPointDataMap[T]>) {
        logger.info(`register: ${name}`);
        if (hookDataSubscriptionMap.has(name)) {
            IS_DEV && console.error(`HookPoint ${name} 已经被注册, 如果这是有意的, 请先注销之前的注册`);
            logger.error(`register: ${name} 已经被注册`);
            return;
        }

        const hookData$ = new Observable<HookEventData>((subscriber) =>
            // 如果返回了Dispose函数, 会在unsubscribe的时候自动调用
            hookResolver((data) => {
                subscriber.next({ type: name, data });
            })
        );

        hookDataSubscriptionMap.set(name, hookData$.subscribe(this.subject$));
    },

    unregister(name: keyof HookPointDataMap) {
        const subscription = hookDataSubscriptionMap.get(name);
        if (subscription) {
            logger.info(`unregister: ${name}`);
            subscription.unsubscribe();
            hookDataSubscriptionMap.delete(name);
        }
    }
};
