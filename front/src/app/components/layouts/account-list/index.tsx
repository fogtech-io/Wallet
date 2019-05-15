import * as React from 'react';
import * as cn from 'classnames';
import { observer } from 'mobx-react';
import {
    AccountItem,
    IAccountItemProps,
} from 'app/components/common/account-item';
import { CurrencyBalanceList } from 'app/components/common/currency-balance-list';
import { DeletableItemWithConfirmation } from 'app/components/common/deletable-item/with-confirmation';
import { Button } from 'app/components/common/button';
import { ImportAccount, IImportAccountForm } from './sub/import-account';
import { CreateAccount, ICreateAccountForm } from './sub/create-account';
import { EmptyAccountList } from './sub/empty-account-list';
import { AddToken } from './sub/add-token';
import { navigate } from 'app/router/navigate';
import { DeleteAccountConfirmation } from './sub/delete-account-confirmation';
import { DownloadFile } from 'app/components/common/download-file';
import { Icon } from 'app/components/common/icon';
import ShowPassword from './sub/show-private-key/index';
import { IValidation } from 'app/api/types';
import { IHasRootStore, withRootStore } from '../layout';
import { RootStore } from 'app/stores';
import { IAccount } from 'app/entities/account';

enum WalletDialogs {
    new,
    add,
    addToken,
    none,
    showPrivateKey,
    changelly,
}

interface IProps extends IHasRootStore {
    className?: string;
    navigateToProfile: (address: string) => void;
}

interface IState {
    visibleDialog: WalletDialogs;
    visibleDialogProps: any[];
}

class DeletableItem extends DeletableItemWithConfirmation<IAccountItemProps> {}

class AccountListLayout extends React.Component<IProps, IState> {
    // ToDo make stateless
    protected get rootStore() {
        return this.props.rootStore as RootStore;
    }

    public state = {
        visibleDialog: WalletDialogs.none,
        visibleDialogProps: [] as any[],
    };

    protected handleClickAccount(address: string) {
        navigate({ path: `/wallet/accounts/${address}` }); // TODO move to router
    }

    private handleDelete = (deleteAddress: string) => {
        this.rootStore.myProfiles.deleteAccount(deleteAddress);
    };

    protected handleAddAccount = async (data: IImportAccountForm) => {
        await this.rootStore.myProfiles.addAccount(
            data.json,
            data.password,
            data.name,
        );

        if (this.rootStore.myProfiles.noValidationMessages) {
            this.closeDialog();
        }
    };

    protected handleCreateAccount = async (data: ICreateAccountForm) => {
        await this.rootStore.myProfiles.createAccount(
            data.password,
            data.name,
            data.privateKey,
        );

        if (this.rootStore.myProfiles.noValidationMessages) {
            this.closeDialog();
        }
    };

    protected switchDialog(name: WalletDialogs, ...args: any[]) {
        this.setState({
            visibleDialog: name,
            visibleDialogProps: args,
        });
    }

    protected closeDialog = () => {
        this.rootStore.myProfiles.resetServerValidation();
        this.switchDialog(WalletDialogs.none);
    };
    protected openNewWalletDialog = this.switchDialog.bind(
        this,
        WalletDialogs.new,
    );
    protected openAddWalletDialog = this.switchDialog.bind(
        this,
        WalletDialogs.add,
    );

    protected handleRename = (address: string, name: string) => {
        this.rootStore.myProfiles.renameAccount(address, name);
    };

    protected handleRequireAddToken = () => {
        this.switchDialog(WalletDialogs.addToken);
    };

    protected handleDeleteToken = (address: string) => {
        this.rootStore.currency.removeToken(address);
    };

    protected handleShowPrivateKey = (address: string) => {
        this.switchDialog(WalletDialogs.showPrivateKey, address);
    };

    protected handleClickProfileIcon = (address: string) => {
        this.rootStore.myProfiles.setCurrent(address);
        this.props.navigateToProfile(address);
    };

    public render() {
        const { className } = this.props;
        const rootStore = this.rootStore;
        return (
            <div className={cn('sonm-accounts', className)}>
                <div className="sonm-accounts__balances">
                    <DownloadFile
                        getData={rootStore.wallet.getWalletExportText}
                        className="sonm-accounts__export-wallet-button"
                        fileName={`sonm-wallet-${
                            rootStore.wallet.walletName
                        }.json`}
                    >
                        <Button
                            tag="div"
                            color="gray"
                            square
                            transparent
                            height={40}
                            className="sonm-accounts__export-wallet-button"
                        >
                            <Icon i="Export" />
                            {' Export wallet'}
                        </Button>
                    </DownloadFile>
                    <CurrencyBalanceList
                        className="sonm-accounts__balance-list"
                        currencyBalanceList={
                            rootStore.myProfiles.fullBalanceList
                        }
                        onRequireAddToken={
                            rootStore.isOffline
                                ? undefined
                                : this.handleRequireAddToken
                        }
                        onDeleteToken={this.handleDeleteToken}
                    />
                </div>
                <div className="sonm-accounts__list">
                    {rootStore.myProfiles.accountList.length === 0 ? (
                        <EmptyAccountList />
                    ) : (
                        rootStore.myProfiles.accountList.map((x: IAccount) => {
                            const item: IAccountItemProps = {
                                account: x,
                                primaryTokenInfo: this.rootStore.currency
                                    .primaryTokenInfo,
                            };
                            return (
                                <DeletableItem
                                    item={item}
                                    Confirmation={DeleteAccountConfirmation}
                                    className="sonm-accounts__list-item"
                                    onDelete={this.handleDelete}
                                    key={x.address}
                                    id={x.address}
                                >
                                    <AccountItem
                                        account={x}
                                        primaryTokenInfo={
                                            this.rootStore.currency
                                                .primaryTokenInfo
                                        }
                                        onClickIcon={this.handleClickAccount}
                                        onClickShowPrivateKey={
                                            this.handleShowPrivateKey
                                        }
                                        onClickProfileIcon={
                                            this.handleClickProfileIcon
                                        }
                                        onRename={this.handleRename}
                                        className="sonm-accounts__list-item-inner"
                                        hasButtons
                                    />
                                </DeletableItem>
                            );
                        })
                    )}
                </div>
                <CurrencyBalanceList
                    className="sonm-accounts__balances"
                    currencyBalanceList={rootStore.myProfiles.fullBalanceList}
                    onRequireAddToken={
                        rootStore.isOffline
                            ? undefined
                            : this.handleRequireAddToken
                    }
                    onDeleteToken={this.handleDeleteToken}
                />
                <div className="sonm-accounts__buttons">
                    <Button
                        type="button"
                        onClick={this.openAddWalletDialog}
                        color="violet"
                        className="sonm-accounts__button"
                    >
                        IMPORT ACCOUNT
                    </Button>
                    <Button
                        type="button"
                        onClick={this.openNewWalletDialog}
                        className="sonm-accounts__button"
                    >
                        CREATE ACCOUNT
                    </Button>
                    {this.state.visibleDialog === WalletDialogs.new ? (
                        <CreateAccount
                            serverValidation={
                                rootStore.myProfiles
                                    .serverValidation as IValidation
                            }
                            onSubmit={this.handleCreateAccount}
                            onClickCross={this.closeDialog}
                        />
                    ) : null}
                    {this.state.visibleDialog === WalletDialogs.add ? (
                        <ImportAccount
                            existingAccounts={
                                rootStore.myProfiles.accountAddressList
                            }
                            serverValidation={
                                rootStore.myProfiles
                                    .serverValidation as IImportAccountForm
                            }
                            onSubmit={this.handleAddAccount}
                            onClickCross={this.closeDialog}
                        />
                    ) : null}
                    {this.state.visibleDialog === WalletDialogs.addToken ? (
                        <AddToken onClickCross={this.closeDialog} />
                    ) : null}
                    {this.state.visibleDialog ===
                    WalletDialogs.showPrivateKey ? (
                        <ShowPassword
                            address={this.state.visibleDialogProps[0]}
                            onClose={this.closeDialog}
                        />
                    ) : null}
                </div>
            </div>
        );
    }
}

export const AccountList = withRootStore(observer(AccountListLayout));

// TODO
