import { Send } from 'app/components/layouts/send';
import { Wallets } from 'app/components/layouts/account-list';
import { App } from 'app/components/layouts/app';
import { History } from 'app/components/layouts/history';
import { SendSuccess } from 'app/components/layouts/send/sub/success';
import { SendConfirm } from 'app/components/layouts/send/sub/confirm';
import { Account } from 'app/components/layouts/account';
import { Profile } from 'app/components/layouts/profile';
import { ProfileList } from 'app/components/layouts/profile-list';
import { DepositWithdrawHistory } from 'app/components/layouts/deposit-withdraw-history';
import { Deposit, Withdraw } from 'app/components/layouts/deposit-withdraw';
import { DepositWithdrawSuccess } from 'app/components/layouts/deposit-withdraw/sub/success';
import { OrderList } from 'app/components/layouts/order-list';
import { DealList } from 'app/components/layouts/deal-list';
import { Deal } from 'app/components/layouts/deal';
import { OrderDetails } from 'app/components/layouts/order-details';
import { OrderCompleteBuy } from 'app/components/layouts/order-complete-buy';

import * as React from 'react';

import { navigate } from './navigate';

let defaultAction;

const navigateToSend = () => navigate({ path: '/send' });
const navigateToHistory = (
    accountAddress: string = '',
    currencyAddress: string = '',
) => {
    navigate({
        path: '/wallet/history',
        query:
            accountAddress || currencyAddress
                ? {
                      address: accountAddress,
                      currency: currencyAddress,
                  }
                : undefined,
    });
};
const navigateToConfirmation = () => navigate({ path: '/wallet/send/confirm' });
const navigateToSuccess = () => navigate({ path: '/wallet/send/success' });
const navigateToMain = () => navigate({ path: '/wallet/accounts' });
const navigateTo = (path: string) => navigate({ path });
const navigateToProfile = (address: string) =>
    navigate({ path: `/market/profiles/${address}` });
const navigateToDeal = (id: string) =>
    navigate({ path: `/market/deals/${id}` });
const navigateToDealList = () => navigate({ path: `/market/deals/` });
const navigateToDepositSuccess = () =>
    navigate({ path: `/market/dw/deposit/success` });
const navigateToDepositConfirm = () =>
    navigate({ path: `/market/dw/deposit/confirm` });
const navigateToWithdrawSuccess = () =>
    navigate({ path: `/market/dw/withdraw/success` });
const navigateToWithdrawConfirm = () =>
    navigate({ path: `/market/dw/withdraw/confirm` });
const navigateToDWHistory = () => navigate({ path: '/market/dw/history' });
const navigateToDeposit = () => navigate({ path: '/market/dw/deposit' });
const navigateToWithdraw = () => navigate({ path: '/market/dw/withdraw' });
const navigateToDeals = () => navigate({ path: '/market/deals' });
const navigateToOrders = () => navigate({ path: `/market/orders` });
const navigateToOrdersByAddress = (creatorAddress: string) =>
    navigate({ path: `/market/orders`, query: { creatorAddress } });
const navigateToOrder = (orderId: string, creatorAddress: string = '') =>
    navigate({
        path: `/market/orders/${orderId}`,
    });
const navigateToOrderBuySuccess = () =>
    navigate({ path: `/market/orders/complete-buy` });
const navigateToMarkets = () => {};

function reload() {
    window.location.reload(true);
}

function replaceWithChild(action: TFnAction): TFnAction {
    return async (ctx: IContext, p: any): Promise<IRouterResult> => {
        const child: IRouterResult = await ctx.next();

        if (child) {
            return child;
        } else {
            return action(ctx, p);
        }
    };
}

// function appendChild(action: TFnAction): TFnAction {
//     return async (ctx: IContext, p: any): Promise<IRouterResult> => {
//         const [me, child] = await Promise.all([action(ctx, p), ctx.next()]);
//
//         return {
//             content: (
//                 <React.Fragment>
//                     {me.content}
//                     {child ? child.content : null}
//                 </React.Fragment>
//             ),
//             browserTabTitle: child ? child.browserTabTitle : me.browserTabTitle,
//             pageTitle: child ? child.pageTitle : me.pageTitle,
//         };
//     };
// }

async function firstByDefault(ctx: IContext, p: any) {
    const params: IRouterResult = await ctx.next();

    return params ? params : ctx.route.children[0].action(ctx, p);
}

export const univeralRoutes: Array<IUniversalRouterItem> = [
    {
        path: '/',
        action: async (ctx: IContext, _: IUrlParams) => {
            const params: IRouterResult = await ctx.next();

            const breadcrumbs = ctx.breadcrumbs;

            ctx.breadcrumbs = [];

            return {
                content: (
                    <App
                        className={
                            params.props ? params.props.className : undefined
                        }
                        breadcrumbs={breadcrumbs}
                        onNavigate={navigateTo}
                        onExit={reload}
                        path={ctx.pathname}
                        title={params.pageTitle}
                        {...params.props}
                    >
                        {params.content}
                    </App>
                ),
                browserTabTitle: params.browserTabTitle || '_SONM_',
            };
        },
        children: [
            {
                path: '/wallet',
                breadcrumbTitle: 'Wallet',
                action: firstByDefault,
                children: [
                    {
                        path: '/send',
                        breadcrumbTitle: 'Send',
                        action: replaceWithChild(
                            async (ctx: IContext, params: IUrlParams) => ({
                                browserTabTitle: 'Send',
                                pageTitle: 'Send',
                                content: (
                                    <Send
                                        onNotAvailable={navigateToMain}
                                        initialAddress={ctx.query.address}
                                        initialCurrency={ctx.query.currency}
                                        onRequireConfirmation={
                                            navigateToConfirmation
                                        }
                                    />
                                ),
                            }),
                        ),
                        children: [
                            {
                                path: '/confirm',
                                action: async (
                                    ctx: IContext,
                                    params: IUrlParams,
                                ) => ({
                                    browserTabTitle: 'Transfer confirmation',
                                    pageTitle: 'Transfer confirmation',
                                    content: (
                                        <SendConfirm
                                            onBack={navigateToSend}
                                            onSuccess={navigateToSuccess}
                                        />
                                    ),
                                }),
                            },
                            {
                                path: '/success',
                                action: async (
                                    ctx: IContext,
                                    params: IUrlParams,
                                ) => ({
                                    browserTabTitle:
                                        'Transaction has been sent',
                                    pageTitle: 'Transaction has been sent',
                                    content: (
                                        <SendSuccess
                                            onClickHistory={navigateToHistory}
                                            onClickSend={navigateToSend}
                                        />
                                    ),
                                }),
                            },
                        ],
                    },
                    {
                        path: '/history',
                        breadcrumbTitle: 'History',
                        action: async (ctx: IContext, params: IUrlParams) => ({
                            browserTabTitle: 'History',
                            pageTitle: 'History',
                            content: (
                                <History
                                    initialAddress={ctx.query.address}
                                    initialCurrency={ctx.query.currency}
                                />
                            ),
                        }),
                    },
                    {
                        path: '/accounts',
                        breadcrumbTitle: 'Accounts',
                        action: (defaultAction = replaceWithChild(
                            async (ctx: IContext, params: IUrlParams) => ({
                                browserTabTitle: 'Accounts',
                                pageTitle: 'Accounts',
                                content: <Wallets />,
                            }),
                        )),
                        children: [
                            {
                                breadcrumbTitle: 'Accounts details',
                                path: '/:address',
                                action: async (
                                    ctx: IContext,
                                    params: IUrlParams,
                                ) => ({
                                    content: (
                                        <Account
                                            initialAddress={params.address}
                                        />
                                    ),
                                    browserTabTitle: 'Account',
                                    pageTitle: 'Account',
                                }),
                            },
                        ],
                    },
                ],
            },
            {
                path: '/market',
                breadcrumbTitle: 'market',
                action: firstByDefault,
                children: [
                    {
                        path: '/profiles',
                        breadcrumbTitle: 'Profiles',
                        action: replaceWithChild(
                            async (ctx: IContext, params: IUrlParams) => ({
                                pathKey: '/profiles',
                                browserTabTitle: 'Profiles',
                                pageTitle: 'Profiles',
                                content: (
                                    <ProfileList
                                        onNavigate={navigateToProfile}
                                    />
                                ),
                            }),
                        ),
                        children: [
                            {
                                breadcrumbTitle: 'Profile details',
                                path: '/:address',
                                action: async (
                                    ctx: IContext,
                                    params: IUrlParams,
                                ) => ({
                                    content: (
                                        <Profile
                                            address={params.address}
                                            onNavigateToOrders={
                                                navigateToOrdersByAddress
                                            }
                                        />
                                    ),
                                    browserTabTitle: 'Profile',
                                    pageTitle: 'Profile',
                                }),
                            },
                        ],
                    },
                    {
                        path: '/dw',
                        action: firstByDefault,
                        children: [
                            {
                                path: '/deposit',
                                action: replaceWithChild(
                                    async (
                                        ctx: IContext,
                                        params: IUrlParams,
                                    ) => ({
                                        content: (
                                            <Deposit
                                                isConfirmation={false}
                                                onNotAvailable={navigateToMain}
                                                onSuccess={
                                                    navigateToDepositSuccess
                                                }
                                                onConfirm={
                                                    navigateToDepositConfirm
                                                }
                                                onBack={
                                                    navigateToDepositSuccess
                                                }
                                            />
                                        ),
                                        browserTabTitle: 'Deposit',
                                        pageTitle: 'Deposit',
                                    }),
                                ),
                                children: [
                                    {
                                        breadcrumbTitle: 'Deposit confirmation',
                                        path: '/confirm',
                                        action: async (
                                            ctx: IContext,
                                            params: IUrlParams,
                                        ) => ({
                                            content: (
                                                <Deposit
                                                    isConfirmation={true}
                                                    onNotAvailable={
                                                        navigateToMain
                                                    }
                                                    onSuccess={
                                                        navigateToDepositSuccess
                                                    }
                                                    onConfirm={
                                                        navigateToDepositConfirm
                                                    }
                                                    onBack={navigateToDeposit}
                                                />
                                            ),
                                            browserTabTitle: 'Deposit',
                                            pageTitle: 'Deposit',
                                        }),
                                    },
                                    {
                                        breadcrumbTitle: '',
                                        path: '/success',
                                        action: (ctx: IContext) => ({
                                            title: 'Success',
                                            content: (
                                                <DepositWithdrawSuccess
                                                    onClickHistory={
                                                        navigateToDWHistory
                                                    }
                                                    onClickDeposit={
                                                        navigateToDeposit
                                                    }
                                                    onClickWithdraw={
                                                        navigateToWithdraw
                                                    }
                                                />
                                            ),
                                            browserTabTitle: 'Deposit',
                                            pageTitle: 'Deposit',
                                        }),
                                    },
                                ],
                            },
                            {
                                path: '/withdraw',
                                action: replaceWithChild(
                                    async (
                                        ctx: IContext,
                                        params: IUrlParams,
                                    ) => ({
                                        content: (
                                            <Withdraw
                                                isConfirmation={false}
                                                onNotAvailable={navigateToMain}
                                                onSuccess={
                                                    navigateToWithdrawSuccess
                                                }
                                                onConfirm={
                                                    navigateToWithdrawConfirm
                                                }
                                                onBack={
                                                    navigateToWithdrawSuccess
                                                }
                                            />
                                        ),
                                        browserTabTitle: 'Withdraw',
                                        pageTitle: 'Withdraw',
                                    }),
                                ),
                                children: [
                                    {
                                        breadcrumbTitle:
                                            'Withdraw confirmation',
                                        path: '/confirm',
                                        action: async (
                                            ctx: IContext,
                                            params: IUrlParams,
                                        ) => ({
                                            content: (
                                                <Withdraw
                                                    isConfirmation={true}
                                                    onNotAvailable={
                                                        navigateToMain
                                                    }
                                                    onSuccess={
                                                        navigateToWithdrawSuccess
                                                    }
                                                    onConfirm={
                                                        navigateToWithdrawConfirm
                                                    }
                                                    onBack={navigateToWithdraw}
                                                />
                                            ),
                                            browserTabTitle: 'Withdraw',
                                            pageTitle: 'Withdraw',
                                            props: {
                                                className:
                                                    'sonm-app--confirmation-bg',
                                            },
                                        }),
                                    },
                                    {
                                        breadcrumbTitle: '',
                                        path: '/success',
                                        action: (ctx: IContext) => ({
                                            title: 'Success',
                                            content: (
                                                <DepositWithdrawSuccess
                                                    onClickHistory={
                                                        navigateToDWHistory
                                                    }
                                                    onClickDeposit={
                                                        navigateToDeposit
                                                    }
                                                    onClickWithdraw={
                                                        navigateToWithdraw
                                                    }
                                                />
                                            ),
                                            browserTabTitle: 'Withdraw',
                                            pageTitle: 'Withdraw',
                                        }),
                                    },
                                ],
                            },
                            {
                                path: '/history',
                                action: async (
                                    ctx: IContext,
                                    params: IUrlParams,
                                ) => ({
                                    content: (
                                        <DepositWithdrawHistory
                                            onClickDeposit={navigateToDeposit}
                                            onClickWithdraw={navigateToWithdraw}
                                        />
                                    ),
                                    browserTabTitle: 'D & W History',
                                    pageTitle: 'D & W History',
                                }),
                            },
                        ],
                    },
                    {
                        path: '/orders',
                        breadcrumbTitle: 'Orders',
                        action: replaceWithChild(
                            async (ctx: IContext, params: IUrlParams) => ({
                                browserTabTitle: 'Market orders',
                                pageTitle: 'Market orders',
                                content: (
                                    <OrderList
                                        filterByAddress={
                                            ctx.query.creatorAddress
                                        }
                                        onNavigateToOrder={navigateToOrder}
                                    />
                                ),
                            }),
                        ),
                        children: [
                            {
                                breadcrumbTitle: '',
                                path: '/complete-buy',
                                action: async (ctx: IContext) => ({
                                    content: (
                                        <OrderCompleteBuy
                                            onClickDeals={navigateToDealList}
                                            onClickMarket={navigateToMarkets}
                                            onClickOrders={navigateToOrders}
                                        />
                                    ),
                                    browserTabTitle: 'Order buy success',
                                    pageTitle: 'Order buy success',
                                }),
                            },
                            {
                                breadcrumbTitle: 'Order details',
                                path: '/:orderId',
                                action: async (
                                    ctx: IContext,
                                    params: IUrlParams,
                                ) => ({
                                    browserTabTitle: 'Order details',
                                    pageTitle: 'Order details',
                                    content: (
                                        <OrderDetails
                                            orderId={params.orderId}
                                            onCompleteBuyingOrder={
                                                navigateToOrderBuySuccess
                                            }
                                        />
                                    ),
                                }),
                            },
                        ],
                    },
                    {
                        path: '/deals/:id',
                        breadcrumbTitle: 'Deals',
                        action: async (ctx: IContext, params: IUrlParams) => ({
                            browserTabTitle: 'Deal details',
                            pageTitle: 'Deal details',
                            content: (
                                <Deal
                                    id={params.id}
                                    onNavigateToDeals={navigateToDeals}
                                />
                            ),
                        }),
                    },
                    {
                        path: '/deals',
                        breadcrumbTitle: 'Deals',
                        action: async (ctx: IContext, params: IUrlParams) => ({
                            browserTabTitle: 'Deals',
                            pageTitle: 'Deals',
                            content: <DealList onNavigate={navigateToDeal} />,
                        }),
                    },
                ],
            },
            {
                path: /.*/,
                action: defaultAction,
            },
        ],
    },
];

export interface IUrlParams {
    [key: string]: string;
}

export interface IContext {
    query: any;
    route: any;
    pathname: string;
    params?: IRouterResult;
    next: () => IRouterResult;
    breadcrumbs: Array<IBreadcrumb>;
}

type TFnAction = (ctx: IContext, params: any) => Promise<IRouterResult>;

export interface IBreadcrumb {
    path: string;
    title: string;
}

interface IUniversalRouterItem {
    path: string | RegExp;
    action?: TFnAction;
    children?: Array<IUniversalRouterItem>;
    breadcrumbTitle?: string;
}

interface IRouterResult {
    content?: React.ReactNode;
    browserTabTitle?: string;
    pageTitle?: string;
    props?: any;
    pathKey?: string;
}

export default univeralRoutes;
