import { CMDID, PETPOS as PosType } from '../const';
import Pet, { PetFactory } from '../entities/pet';
import { SocketReceivedPromise, SocketSendByQueue } from '../utils';

type PosType = AttrConsts<typeof PosType>;

/**
 * @description 更新仓库精灵列表
 */
export const updateStroageInfo = async () => {
    await new Promise((resolve, reject) => {
        PetManager.getLovePetList();
        PetManager.updateBagInfo(() => resolve(undefined));
    });
    return await new Promise((resolve, reject) => {
        PetStorage2015InfoManager.getTotalInfo(() => resolve(undefined));
    });
};

/**
 * @description 获取精灵列表
 */
export async function getPets(location: PosType): Promise<Pet[]> {
    await updateStroageInfo();
    let dict: any[];
    switch (location) {
        case PosType.bag1:
            dict = PetManager._bagMap.getValues();
            break;
        case PosType.secondBag1:
            dict = PetManager._secondBagMap.getValues();
            break;
        case PosType.storage:
            dict = PetStorage2015InfoManager.getInfoByType(0, 0);
            break;
        case PosType.elite:
            dict = PetStorage2015InfoManager.getInfoByType(1, 0);
            break;
    }

    if (location === PosType.bag1 || location === PosType.secondBag1) {
        return dict!.map((v: PetInfo) => new Pet(v));
    } else {
        return dict!.map((v: PetInfo) => PetFactory.formatByCatchtime(v.catchTime));
    }
}

export const isDefault = (ct: number) => PetManager.defaultTime === ct;
export const setDefault = PetManager.setDefault.bind(PetManager);

export const getPetLocation = (ct: number) => {
    return updateStroageInfo().then(() => {
        const r = PetStorage2015InfoManager.allInfo.find((v) => v.catchTime === ct);
        if (!r) {
            if (PetManager._bagMap.containsKey(ct)) {
                return PosType.bag1;
            } else if (PetManager._secondBagMap.containsKey(ct)) {
                return PosType.secondBag1;
            } else {
                return -1;
            }
        } else {
            return r.posi;
        }
    });
};

export const setPetLocation = async (ct: number, newLocation: PosType) => {
    if (!ct) return false;
    let l = await getPetLocation(ct);
    if (l === newLocation || l === -1) return false;
    switch (newLocation) {
        case PosType.secondBag1:
            if (PetManager.isSecondBagFull) return false;
            await SocketReceivedPromise(CMDID.PET_RELEASE, () => {
                if (l === PosType.bag1) {
                    PetManager.bagToSecondBag(ct);
                } else if (l === PosType.storage || l === PosType.elite) {
                    PetManager.storageToSecondBag(ct);
                }
            });
            break;
        case PosType.bag1:
            if (PetManager.isBagFull) return false;
            await SocketReceivedPromise(CMDID.PET_RELEASE, () => {
                if (l === PosType.secondBag1) {
                    PetManager.secondBagToBag(ct);
                } else if (l === PosType.storage) {
                    PetManager.storageToBag(ct);
                } else if (l === PosType.elite) {
                    PetManager.loveToBag(ct);
                }
            });
            break;
        case PosType.storage:
            if (l === PosType.elite) {
                await SocketReceivedPromise(CMDID.DEL_LOVE_PET, () => PetManager.delLovePet(0, ct, 0));
                break;
            }
            await SocketReceivedPromise(CMDID.PET_RELEASE, () => {
                if (l === PosType.bag1) {
                    PetManager.bagToStorage(ct);
                } else if (l === PosType.secondBag1) {
                    PetManager.secondBagToStorage(ct);
                }
            });
            break;
        case PosType.elite:
            if (l !== PosType.storage) {
                await SocketReceivedPromise(CMDID.PET_RELEASE, () => {
                    if (l === PosType.bag1) {
                        PetManager.bagToStorage(ct);
                    } else if (l === PosType.secondBag1) {
                        PetManager.secondBagToStorage(ct);
                    }
                });
            }
            if ((await getPetLocation(ct)) === PosType.storage) {
                await SocketReceivedPromise(CMDID.ADD_LOVE_PET, () => PetManager.addLovePet(0, ct, 0));
                PetStorage2015InfoManager.changePetPosi(ct, PosType.elite);
            }
            break;
        default:
            break;
    }

    return updateStroageInfo().then((v) => true);
};

export const popPetFromBag = async (ct: number) => {
    const locat = await getPetLocation(ct);
    if (locat !== PosType.elite && locat !== PosType.storage) {
        await setPetLocation(ct, PosType.storage);
    }
};

export function cureOnePet(ct: number) {
    SocketSendByQueue(CMDID.PET_ONE_CURE, ct);
}

export function cureAllPet() {
    PetManager.noAlarmCureAll();
}

export function ToggleAutoCure(enable: boolean) {
    SocketSendByQueue(42019, [22439, Number(enable)]);
}

/**
 * @description 计算克制倍率
 */
export function calcElementRatio(e1: number, e2: number) {
    const mapping = (obj: any): number[] => {
        if (Object.hasOwn(obj, 'is_dou')) {
            return obj.att!.split(' ').map((v: string) => SkillXMLInfo.typeMap[v].en);
        } else {
            return [obj.en];
        }
    };
    const eNameArr1 = mapping(SkillXMLInfo.typeMap[e1]);
    const eNameArr2 = mapping(SkillXMLInfo.typeMap[e2]);
    return TypeXMLInfo.getRelationsPow(eNameArr1, eNameArr2);
}