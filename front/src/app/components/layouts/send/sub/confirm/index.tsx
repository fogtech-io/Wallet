import * as React from 'react';
import Input from 'antd/es/input';
import Icon from 'antd/es/icon';
import { Form, FormField } from 'app/components/common/form';
import * as cn from 'classnames';
import { IdentIcon } from 'app/components/common/ident-icon/index';
import { Button } from 'app/components/common/button/index';
import { observer } from 'mobx-react';
import { withRootStore, IHasRootStore } from 'app/components/layouts/layout';
import { RootStore } from 'app/stores';

interface IProps extends IHasRootStore {
    className?: string;
    onSuccess: () => void;
    onBack: () => void;
}

class SendConfirmLayout extends React.Component<IProps, any> {
    // ToDo make stateless

    protected get rootStore() {
        return this.props.rootStore as RootStore;
    }

    public state = {
        password: '',
        validationPassword: '',
    };

    public handleConfrim = async (event: any) => {
        const sendStore = this.rootStore.send;
        const historyStore = this.rootStore.walletHistoryList;

        event.preventDefault();

        const password = event.target.password.value;

        const isPasswordValid = await sendStore.checkSelectedAccountPassword(
            password,
        );

        if (isPasswordValid) {
            (sendStore.confirmTransaction(password) as any).then(() =>
                historyStore.update(),
            );

            sendStore.resetUserInput();

            this.setState({ validationPassword: '' });

            this.props.onSuccess();
        } else {
            this.setState({ validationPassword: 'Invalid password' });
        }
    };

    public handleCancel = () => {
        this.rootStore.send.resetServerValidation();

        this.props.onBack();
    };

    public handleChange = (e: any) => {
        this.setState({ password: e.target.value });
    };

    public render() {
        const rootStore = this.rootStore;
        const mainStore = rootStore.main;
        const sendStore = rootStore.send;

        const accountAddress = sendStore.fromAddress;
        const account = rootStore.myProfiles.getItem(accountAddress);
        const accountName = account ? account.name : '';
        const currency = rootStore.currency.getItem(sendStore.currencyAddress);
        const amount = sendStore.amount;
        const gasLimit = sendStore.gasLimit;
        const gasPrice = sendStore.gasPriceGwei;
        const toAddress = sendStore.toAddress;

        if (!currency) {
            return null;
        }

        return (
            <div className={cn('sonm-send-confirm', this.props.className)}>
                <section className="sonm-send-confirm__from-to">
                    <div className="sonm-send-confirm__account">
                        <IdentIcon
                            address={accountAddress}
                            className="sonm-send-confirm__account-blockies"
                        />
                        <span className="sonm-send-confirm__account-name">
                            {accountName}
                        </span>
                        <span className="sonm-send-confirm__account-addr">
                            {accountAddress}
                        </span>
                    </div>
                    <div className="sonm-send-confirm__arrow" />
                    <div className="sonm-send-confirm__account">
                        <IdentIcon
                            address={toAddress}
                            className="sonm-send-confirm__account-blockies"
                        />
                        <span className="sonm-send-confirm__account-target">
                            {toAddress}
                        </span>
                    </div>
                </section>
                <dl className="sonm-send-confirm__values">
                    <dt>Amount</dt>
                    <dd>
                        {amount} {currency.symbol}
                    </dd>
                    <dt>Gas limit</dt>
                    <dd>{gasLimit}</dd>
                    <dt>Gas price</dt>
                    <dd>{gasPrice} Gwei</dd>
                </dl>
                <div className="sonm-send-confirm__password">
                    <h2 className="sonm-send-confirm__password-header">
                        Please enter account password
                    </h2>
                    <Form
                        onSubmit={this.handleConfrim}
                        className="sonm-send-confirm__password-form"
                    >
                        <FormField
                            label=""
                            className="sonm-send-confirm__password-field"
                            error={this.state.validationPassword}
                        >
                            <Input
                                autoComplete="off"
                                name="password"
                                className="sonm-send-confirm__password-input"
                                prefix={
                                    <Icon
                                        type="lock"
                                        style={{ fontSize: 13 }}
                                    />
                                }
                                type="password"
                                placeholder="Password"
                                value={this.state.password}
                                onChange={this.handleChange}
                            />
                        </FormField>
                        <div className="sonm-send-confirm__password-button-ct">
                            <Button
                                className="sonm-send-confirm__password-button"
                                transparent
                                type="button"
                                onClick={this.handleCancel}
                            >
                                Back
                            </Button>
                            <Button
                                disabled={mainStore.isOffline}
                                className="sonm-send-confirm__password-button"
                                type="submit"
                                color="violet"
                            >
                                Send
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        );
    }
}

export const SendConfirm = withRootStore(observer(SendConfirmLayout));

export default SendConfirm;
