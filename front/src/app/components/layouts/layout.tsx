import * as React from 'react';
import { RootStore } from 'app/stores';
import { RootStoreContext } from 'app/contexts/root-store-context';

export interface IHasRootStore {
    rootStore?: RootStore;
}

export class Layout<TProps extends IHasRootStore> extends React.Component<
    TProps,
    never
> {
    protected get rootStore() {
        return this.props.rootStore as RootStore;
    }
}

export function withRootStore<T>(
    LayoutComponent: React.ComponentType<T & IHasRootStore>,
) {
    return (props: T & IHasRootStore) => (
        <RootStoreContext.Consumer>
            {rootStore => <LayoutComponent {...props} rootStore={rootStore} />}
        </RootStoreContext.Consumer>
    );
}
