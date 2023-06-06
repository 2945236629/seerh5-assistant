declare type Dict<T extends object> = Record<string | number, T>;
declare type Callback<T = unknown> = (this: T, ...args: any[]) => void;

declare namespace SAType {
    type EventHandler<E extends egret.EventDispatcher> = (event?: E) => void;

    class HashMap<T extends object> {
        containsKey(key: any): boolean;
        getValues(): Array<T>;
        private _length: number;
        private _content: Dict<T>;
        get length(): number;
    }

    interface BaseObj {
        [property: string]: string | number | unknown | undefined;
    }

    interface PetObj extends BaseObj {
        ID: number;
        DefName: string;
        Type: number;
    }

    type PetLike = PetInfo | PetStorage2015PetInfo | PetObj | PetListInfo;

    interface MoveObj extends BaseObj {
        ID: number;
        Name: string;
        Accuracy: number;
        Category: number;
        MaxPP: number;
        Type: number;
        pp?: number;
        Power?: number;
        MustHit?: number;
        Priority?: number;
        SideEffect?: string;
        SideEffectArg?: string;
    }

    interface ItemObj extends BaseObj {
        ID: number;
        Name: string;
        Bean?: number;
        DailyKey?: number;
        DailyOutMax?: number;
        Hide?: number;
        LifeTime?: number;
        Price?: number;
        Sort?: number;
        Tradability: number;
        VipTradability: number;
        wd: number;
        Max?: number;
        UseMax?: number;
        purpose?: number;
        NewSeIdx?: number;
    }

    interface ElementObj extends BaseObj {
        cn: string;
        en: string;
        id: number;
        att?: string;
        is_dou?: number;
    }

    interface StatusEffectObj extends BaseObj {
        ID: number;
        Name: number;
        Efftype: 0 | 1;
    }

    interface PetFragmentLevelBoss extends BaseObj {
        ID: number;
        BattleBoss: number;
        BossID: number;
        Desc: string;
    }

    interface PetFragmentLevelObj extends BaseObj {
        ID: number;
        Configure: {
            Times: number;
            TimeValue: number;
            FailTimes: number;
            ProgressValue: number;
        };
        EasyBattle: { Task: PetFragmentLevelBoss[] };
        NormalBattle: { Task: PetFragmentLevelBoss[] };
        HardBattle: { Task: PetFragmentLevelBoss[] };
        Reward: {
            ItemID: number;
        };
    }

    interface SuitObj extends BaseObj {
        cloths: string;
        id: number;
        name: string;
        Desc: string;
        suitdes: string;
    }

    interface TitleObj extends BaseObj {
        ID: number;
        Desc: string;
        title: string;
        abtext?: string;
    }

    interface ObserverList<T> {
        array: Array<T>;
    }

    type SocketRequestData = (egret.ByteArray | number)[];
}

/** `sac`全局变量使用的额外命名空间 */
declare interface Window {
    sac: {
        /** 原生客户端`console.log`的正则过滤列表 */
        filterLogText: RegExp[];
        /** 原生客户端`console.warn`的正则过滤列表 */
        filterWarnText: RegExp[];
        SeerH5Ready: boolean;
        SacReady: boolean;
    };
}

declare namespace RES {
    function getVirtualUrl(url: string): string;
    function getResByUrl(url: string): Promise<egret.HashObject>;
}

declare interface AppDoStyle {
    '0': 'DESTROY';
    '1': 'HIDEN';
    '2': 'NULL';
    DESTROY: 0;
    HIDEN: 1;
    NULL: 2;
}

declare const AppDoStyle: AppDoStyle;

//common
declare var EventManager: egret.EventDispatcher;

// sa-loader
declare var OnlineManager: any;

// init/helper
declare var Alarm: any;
declare var Alert: any;
declare var BatteryController: any;

// init/module
declare var UIUtils: null;

// utils/sa-utils
declare var CountermarkEvent: any;

// entities
declare var EffectInfoManager: any;
declare var CountExpPanelManager: any;

// popViewManager
declare class PopView extends eui.Component {}

// mods
declare var GuideManager: any;
declare var SystemTimerManager: any;
declare var markCenter: any;
declare var PetSkinController: any;
declare var PetSkinXMLInfo: any;
declare var ClientConfig: any;
declare var config: any;

declare var PetFightSkinSkillReplaceXMLInfo: any;
declare var PetIdTransform: any;
declare var NatureXMLInfo: any;

declare class SocketEvent extends egret.Event {
    data?: egret.ByteArray;
}
declare class SocketErrorEvent extends egret.Event {}

declare class PetEvent extends egret.Event {
    static readonly EQUIP_SKIN: string;
    constructor(type: string, catchTime: number, obj: any);
}

declare class PetFightEvent extends egret.Event {
    static readonly ALARM_CLICK: 'fight_alarmClick';
    static readonly ON_USE_PET_ITEM: 'onUsePetItem';
    static readonly CHANGE_PET: 'changePet';
    constructor(type: string, obj?: any);
}

declare namespace baseMenuComponent {
    class BaseMenuComponent {
        selectedValue: any;
    }
}
