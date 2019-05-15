import * as React from 'react';
import { Icon } from '../icon';
import * as cn from 'classnames';
import { IListHeaderProps } from './types';

export class ListHeader extends React.Component<IListHeaderProps, any> {
    protected getOrderIconName = (orderKey: string) => {
        if (orderKey === this.props.orderBy) {
            return this.props.orderDesc ? 'OrderDesc' : 'OrderAsc';
        }
        return 'OrderAsc';
    };

    protected handleClickOrder = (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {
        const selectedKey = event.currentTarget.value;
        if (this.props.onChangeOrder) {
            this.props.onChangeOrder(
                selectedKey,
                !(this.props.orderBy === selectedKey && this.props.orderDesc),
            );
        }
    };

    protected handleClickPageLimit = (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {
        const limit = parseInt(event.currentTarget.value, undefined);
        if (limit !== this.props.pageLimit && this.props.onChangeLimit) {
            this.props.onChangeLimit(limit);
        }
    };

    public render() {
        return (
            <div className={cn('list-header', this.props.className)}>
                <div className="list-header__sortings">
                    Sort by:
                    <div className="list-header__sortings-container">
                        {Object.keys(this.props.orderKeys).map(orderKey => (
                            <button
                                value={orderKey}
                                className={cn(
                                    'list-header__sortings-container-item',
                                    {
                                        'list-header__sortings-container-item--selected':
                                            orderKey === this.props.orderBy,
                                    },
                                )}
                                onClick={this.handleClickOrder}
                                key={orderKey}
                            >
                                {this.props.orderKeys[orderKey]}
                                <Icon
                                    className="list-header__sortings-container-icon"
                                    i={this.getOrderIconName(orderKey)}
                                />
                            </button>
                        ))}
                    </div>
                </div>
                <div className="list-header__pagesize">
                    {this.props.pageLimits &&
                        this.props.pageLimits.map((limit: number) => (
                            <button
                                className="list-header__pagesize-button"
                                key={limit}
                                value={limit}
                                onClick={this.handleClickPageLimit}
                            >
                                <span
                                    className={cn(
                                        'list-header__pagesize-button-label',
                                        {
                                            'list-header__pagesize-button-label--selected':
                                                limit === this.props.pageLimit,
                                        },
                                    )}
                                >
                                    {limit}
                                </span>
                            </button>
                        ))}
                    {this.props.onRefresh ? (
                        <button
                            onClick={this.props.onRefresh}
                            className="list-header__pagesize-refresh"
                        >
                            <Icon i="Sync" />
                        </button>
                    ) : null}
                </div>
            </div>
        );
    }
}

export default ListHeader;
export * from './types';
