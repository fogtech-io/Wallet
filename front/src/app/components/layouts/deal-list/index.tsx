import * as React from 'react';
import { DealListView } from './view';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import { DealFilterPanel } from './sub/deal-filter-panel';
import { IDealFilter } from 'app/stores/deal-filter';
import { DealListEmpty } from './sub/deal-list-empty';
import { withRootStore, Layout, IHasRootStore } from '../layout';

interface IProps extends IHasRootStore {
    className?: string;
    filterByAddress?: string;
    onClickDeal: (dealId: string) => void;
    onClickViewMarket: () => void;
}

const emptyFn = () => {};

class DealListLayout extends Layout<IProps> {
    protected get filterStore() {
        return this.rootStore.dealFilter;
    }

    protected get listStore() {
        return this.rootStore.dealList;
    }

    public componentDidMount() {
        this.rootStore.dealList.startAutoUpdate();
    }

    public componentWillUnmount() {
        this.rootStore.dealList.stopAutoUpdate();
    }

    protected handleUpdateFilter = (
        key: keyof IDealFilter,
        value: string | boolean | [Date, Date],
    ) => {
        this.filterStore.updateUserInput({ [key]: value });
    };

    protected handleChangePage = (page: number) => {
        this.listStore.updateUserInput({ page });
    };

    protected handleChangeOrder = (orderKey: string, isDesc: boolean) => {
        this.listStore.updateUserInput({
            sortBy: orderKey,
            sortDesc: isDesc,
        });
    };

    public render() {
        const p = this.props;
        const listStore = this.listStore;
        const filterStore = this.filterStore;

        const filterPanel = (
            <DealFilterPanel
                query={filterStore.query}
                dateRange={filterStore.dateRange}
                onlyActive={filterStore.onlyActive}
                onUpdateFilter={this.handleUpdateFilter}
            />
        );
        const data = toJS(listStore.records);

        return data.length === 0 ? (
            <DealListEmpty
                onClickViewMarket={p.onClickViewMarket}
                onClickBuyResources={emptyFn}
            />
        ) : (
            <DealListView
                data={data}
                marketAccountAddress={
                    this.rootStore.myProfiles.currentProfileAddress
                }
                filterPanel={filterPanel}
                onClickRow={p.onClickDeal}
                onClickBuyResources={emptyFn}
                orderBy={listStore.sortBy}
                orderDesc={listStore.sortDesc}
                onChangeOrder={this.handleChangeOrder}
                currentPage={listStore.page}
                pageSize={listStore.limit}
                totalRecords={listStore.records.length}
                onChangePage={this.handleChangePage}
            />
        );
    }
}

export const DealList = withRootStore(observer(DealListLayout));

export { DealListView };
