import * as React from 'react';
import Alert from 'antd/es/alert';
import * as cn from 'classnames';
import { inject, observer } from 'mobx-react';
import { MainStore } from 'app/stores/main';
import { AbstractStore } from 'app/stores/abstract-store';
import { Balance } from 'app/components/common/balance-view';
import { LoadMask } from 'app/components/common/load-mask';
import { AlertList } from './sub/alerts';
import { NavMenu } from './sub/nav-menu/index';

interface IProps {
    className?: string;
    children: any;
    error: string;
    selectedNavMenuItem: string;
    mainStore: MainStore;
    onNavigate: (url: string) => void;
}

@inject('mainStore', 'historyStore')
@observer
export class App extends React.Component<IProps, any> {
    protected static menuConfig = [
        { title: 'Accounts', url: '/accounts' },
        { title: 'Send', url: '/send' },
        { title: 'History', url: '/history' },
    ];

    protected get stores(): AbstractStore[] {
        const props: any = this.props;

        return Object.keys(props).map(key => props[key]).filter(prop => prop instanceof AbstractStore);
    }

    protected get isPending() { return AbstractStore.getAccumulatedFlag('isPending', ...this.stores); }
    protected get isOffline() { return AbstractStore.getAccumulatedFlag('isOffline', ...this.stores); }

    public render() {
        const {
            className,
            selectedNavMenuItem,
            children,
            mainStore: {
                firstTokenBalance,
                secondTokenBalance,
                accountMap,
            },
        } = this.props;

        const disabledMenu = this.isOffline || (accountMap.size === 0)
            ? '/send'
            : '';

        return (
            <div className={cn('sonm-app', className)}>
                <LoadMask white visible={this.isPending}>
                    <div className="sonm-app__nav">
                        <div className="sonm-nav">
                            <div className="sonm-nav__logo" />
                                <NavMenu
                                    url={selectedNavMenuItem}
                                    items={App.menuConfig}
                                    disabled={disabledMenu}
                                    onChange={this.props.onNavigate}
                                />
                                <Balance
                                    className="sonm-nav__total"
                                    fullString={firstTokenBalance}
                                    fontSizePx={18}
                                />

                                <Balance
                                    className="sonm-nav__total"
                                    fullString={secondTokenBalance}
                                    fontSizePx={18}
                                />
                        </div>
                    </div>
                    <div className="sonm-app__offline-alert">
                        {this.isOffline
                            ? <Alert
                                key="offline"
                                showIcon
                                message="Offline"
                                description="No blockchain node connection"
                                type="warning"
                            /> : null
                        }
                    </div>
                    <AlertList className="sonm-app__alerts"/>
                    <div className="sonm-alert sonm-alert--info">
                        Wallet works in testnet! Do not use real keys, Ether or tokens.
                    </div>
                    <div className="sonm-app__content">
                        {children}
                    </div>
                </LoadMask>
            </div>
        );
    }
}
