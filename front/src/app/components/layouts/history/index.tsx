import * as React from 'react';
import Table from 'antd/es/table';
import {
    DateRangeDropdown,
    IDateRangeChangeParams,
} from 'app/components/common/date-range-dropdown';
import Select from 'antd/es/select';
import Input from 'antd/es/input';
import * as cn from 'classnames';
import { observer } from 'mobx-react';
import { rootStore } from 'app/stores';
import { ISendTransactionResult } from 'app/api';
import { ColumnProps } from 'antd/lib/table';
import * as moment from 'moment';
import { AccountBigSelect } from 'app/components/common/account-big-select';
import { IdentIcon } from 'app/components/common/ident-icon';
import { Balance } from 'app/components/common/balance-view';
import { Hash } from 'app/components/common/hash-view';

const Option = Select.Option;

const filterStore = rootStore.walletHistoryFilterStore;
const listStore = rootStore.walletHistoryListStore;

class TxTable extends Table<ISendTransactionResult> {}

interface IProps {
    className?: string;
}

@observer
export class History extends React.Component<IProps, any> {
    protected static columns: Array<ColumnProps<ISendTransactionResult>> = [
        {
            className: 'sonm-tx-list__cell-time sonm-tx-list__cell',
            dataIndex: 'timestamp',
            title: 'Time',
            render: (time, record) => {
                const m = moment(time);

                return [
                    <div key="1">{m.format('H:mm:ss')}</div>,
                    <div key="2">{m.format('D MMM YY')}</div>,
                ];
            },
        },
        {
            dataIndex: 'fromAddress',
            className: 'sonm-tx-list__cell-from sonm-tx-list__cell',
            title: 'From',
            render: (_, record) => {
                const addr = record.fromAddress;
                const account = rootStore.myProfilesStore.accountMap.get(addr);
                const name = account ? account.name : '';

                return [
                    <div key="0" className="sonm-tx-list__cell-from-name">
                        {name}
                    </div>,
                    <IdentIcon
                        key="1"
                        address={addr}
                        sizePx={20}
                        className="sonm-tx-list__cell-from-icon"
                    />,
                    <Hash
                        key="2"
                        className="sonm-tx-list__cell-from-addr"
                        hash={addr}
                        hasCopyButton
                    />,
                ];
            },
        },
        {
            dataIndex: 'toAddress',
            className: 'sonm-tx-list__cell-to sonm-tx-list__cell',
            title: 'To',
            render: (_, record) => {
                const addr = record.toAddress;
                const account = rootStore.myProfilesStore.accountMap.get(addr);
                const name = account ? account.name : '';

                return [
                    <div key="0" className="sonm-tx-list__cell-from-name">
                        {name}
                    </div>,
                    <IdentIcon
                        key="1"
                        address={addr}
                        sizePx={20}
                        className="sonm-tx-list__cell-to-icon"
                    />,
                    <Hash
                        key="2"
                        hash={addr}
                        hasCopyButton
                        className="sonm-tx-list__cell-to-hash"
                    />,
                ];
            },
        },
        {
            dataIndex: 'amount',
            className: 'sonm-tx-list__cell-amount sonm-tx-list__cell',
            title: 'Amount / fee',
            render: (_, record) => {
                const addr = record.currencyAddress;

                let symbol = record.currencySymbol || '';

                if (!symbol) {
                    const currency = rootStore.mainStore.currencyMap.get(addr);

                    if (currency) {
                        symbol = currency.symbol;
                    }
                }

                const result = [
                    <Balance
                        className="sonm-tx-list__cell-amount-value"
                        key="0"
                        symbol={symbol}
                        balance={record.amount}
                        decimalDigitAmount={10}
                        decimalPointOffset={record.decimalPointOffset}
                    />,
                ];

                if (record.fee) {
                    result.push(
                        <Balance
                            key="1"
                            className="sonm-tx-list__cell-amount-fee"
                            balance={record.fee}
                            symbol="Ether"
                            decimalDigitAmount={10}
                            decimalPointOffset={18}
                        />,
                    );
                }

                return (
                    <div className="sonm-tx-list__cell-amount-ct">{result}</div>
                );
            },
        },
        {
            dataIndex: 'hash',
            title: 'TxHash',
            className: 'sonm-tx-list__cell-hash sonm-tx-list__cell',
            render: (_, record) => {
                return record.hash.indexOf('0x') !== -1 ? (
                    <Hash hash={record.hash} hasCopyButton />
                ) : (
                    record.hash
                );
            },
        },
        {
            dataIndex: 'status',
            title: 'Status',
            className: 'sonm-tx-list__cell-status sonm-tx-list__cell',
            render: (_, record) => {
                const cls = `sonm-tx-list__cell-status--${record.status}`;

                return (
                    <div className={cn('sonm-tx-list__cell-status', cls)}>
                        {record.status}
                    </div>
                );
            },
        },
    ];

    constructor(props: IProps) {
        super(props);
        listStore.update();
    }

    protected handleChangeAccount = (from: string) => {
        filterStore.updateUserInput({
            fromAddress: from === 'all' ? '' : from,
        });
    };

    protected handleChangeTime = (params: IDateRangeChangeParams) => {
        filterStore.updateUserInput({
            timeStart: params.value[0].valueOf(),
            timeEnd: params.value[1].valueOf(),
        });
    };

    protected handleSelectCurrency = (value: any) => {
        const currencyAddress = value as string;
        filterStore.updateUserInput({ currencyAddress });
    };

    protected handleChangeQuery = (event: any) => {
        const query = event.target.value;
        filterStore.updateUserInput({ query });
    };

    public handleChangePage(page: number) {
        listStore.updateUserInput({ page });
    }

    public render() {
        const { className } = this.props;

        const pagination = {
            total: listStore.total,
            defaultPageSize: listStore.limit,
            current: listStore.page,
            onChange: this.handleChangePage,
        };

        return (
            <div className={cn('sonm-history', className)}>
                <AccountBigSelect
                    className="sonm-history__select-account"
                    returnPrimitive
                    onChange={this.handleChangeAccount}
                    accounts={rootStore.myProfilesStore.accountList}
                    value={filterStore.fromAddress}
                    hasEmptyOption
                />
                <DateRangeDropdown
                    className="sonm-history__date-range"
                    value={[
                        new Date(filterStore.timeStart),
                        new Date(filterStore.timeEnd),
                    ]}
                    name="date-range-history"
                    onChange={this.handleChangeTime}
                />
                <Select
                    onChange={this.handleSelectCurrency}
                    value={filterStore.currencyAddress}
                    className="sonm-history__select-currency"
                >
                    {rootStore.mainStore.fullBalanceList.map(x => (
                        <Option
                            key={x.address}
                            value={x.address}
                            title={x.symbol}
                        >
                            {x.symbol}
                        </Option>
                    ))}
                    <Option value="" title="">
                        All coins
                    </Option>
                </Select>
                <Input
                    placeholder="Search by recipient address / TxHash"
                    onChange={this.handleChangeQuery}
                    className="sonm-history__query"
                    value={filterStore.query}
                />

                <TxTable
                    className="sonm-history__table sonm-tx-list"
                    dataSource={listStore.records}
                    columns={History.columns}
                    pagination={pagination}
                    rowKey="hash"
                />
            </div>
        );
    }
}
