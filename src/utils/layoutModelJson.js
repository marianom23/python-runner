export const layoutModelJson = (terminalIcon, folderIcon) => ({
  global: {
    splitterEnableHandle: true,
    tabEnablePopout: false,
    tabSetEnableActiveIcon: false,
    tabSetMinWidth: 130,
    tabSetMinHeight: 100,
    borderMinSize: 100
  },
  borders: [
    {
      type: 'border',
      selected: 1,
      size: 310,
      location: 'bottom',
      children: [
        {
          type: 'tab',
          id: '#5b2d45ed-35f6-45e2-bf4f-31570819e40d',
          name: 'Output',
          component: 'ds',
          enableClose: false,
            // icon: 'images/bar_chart.svg'
        },
        {
          type: 'tab',
          id: '#c0fd1298-bcba-4f7c-a7d8-7c836944ec63',
          name: 'Terminal',
          enableClose: false,
          component: 'TerminalOutputComponent',
          icon: terminalIcon
        },
        {
          type: 'tab',
          id: '#7bac972e-fd5f-4582-a511-4feede448394',
          name: 'Graficos',
            component: 'GraphOutputComponent',
          enableClose: false
        }
      ]
    },
    {
      type: 'border',
      location: 'left',
      children: [
        {
          type: 'tab',
          id: '#3f527eca-f884-45be-b174-f7bbc27ac285',
          name: 'Archivos minimizados',
          component: 'NavigationComponent',
          enableClose: false,
          icon: folderIcon
        }
      ]
    },
    {
      type: 'border',
      location: 'right',
      children: [
        {
          type: 'tab',
          id: '#ee90f6c7-5724-41c8-93be-b38579c1c98f',
          name: 'Options',
          component: 'OptionsComponent',
          enableClose: false,
          // icon: 'images/settings.svg'
        }
      ]
    }
  ],
  layout: {
    type: 'row',
    id: '#3a8361ce-881c-44d6-827c-487d1fcdb066',
    children: [
    ]
  },
  popouts: {}
});

