export const idList = [
    1, //赛尔豆
    300065, //特性重组剂Ω
    300066, //通用刻印激活水晶
    1400352, //泰坦之灵
    1707511, //功勋点数
    1721558, //界神印记
    1721761, //王者精魄
    1706927, //红宝石
    1706928, //绿宝石
    1717452, //荣耀铸币
    1717451, //圣战奖章
    1722506, //先锋旗帜
];

declare namespace pveEnterPanel {
    class PveEnterPanel extends BasicMultPanelModule {}
    class PveResourceCollection extends BasicPanel {
        menu: baseMenuComponent.BaseMenuComponent;
        onChangeMinor(): void;
    }
}

export const openModuleList: { [id: number]: any } = {
    1707511: async () => {
        const delay = window.delay;
        await ModuleManager.showModuleByID(18);
        const curModule = ModuleManager.currModule as pveEnterPanel.PveEnterPanel;
        const panelName = 'pveEnterPanel.PveResourceCollection';
        curModule.service.openPanel(panelName);
        await delay(1500);
        const curPanel = curModule.panelMap[panelName] as pveEnterPanel.PveResourceCollection;
        curPanel.menu.selectedValue = 'ITEM';
        curPanel.onChangeMinor();
    }, //功勋点数
    1721558: async () => {
        const delay = window.delay;
        await ModuleManager.showModuleByID(18);
        const curModule = ModuleManager.currModule as pveEnterPanel.PveEnterPanel;
        const panelName = 'pveEnterPanel.PveResourceCollection';
        curModule.service.openPanel(panelName);
        await delay(1500);
        const curPanel = curModule.panelMap[panelName] as pveEnterPanel.PveResourceCollection;
        curPanel.menu.selectedValue = 'ITEM';
        curPanel.onChangeMinor();
    }, //界神印记
    1721761: async () => {
        const delay = window.delay;
        await ModuleManager.showModuleByID(18);
        const curModule = ModuleManager.currModule as pveEnterPanel.PveEnterPanel;
        const panelName = 'pveEnterPanel.PveResourceCollection';
        curModule.service.openPanel(panelName);
        await delay(1500);
        const curPanel = curModule.panelMap[panelName] as pveEnterPanel.PveResourceCollection;
        curPanel.menu.selectedValue = 'MARK';
        curPanel.onChangeMinor();
    }, //王者精魄
    1717452: async () => {
        ModuleManager.showModuleByID(2);
    }, //荣耀铸币
    1717451: async () => {
        ModuleManager.showModuleByID(2);
    }, //圣战奖章
    1722506: async () => {
        ModuleManager.showModule('pveSpt');
    }, //先锋旗帜
};
