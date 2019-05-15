import * as React from 'react';
import { ProfileView } from './view';
import { observer } from 'mobx-react';
import { withRootStore, Layout, IHasRootStore } from '../layout';

interface IProps extends IHasRootStore {
    className?: string;
    onNavigateToOrders: (address: string) => void;
    onNavigateToKyc: () => void;
}

const returnFirstArg = (...as: any[]) => String(as[0]);

class ProfileLayout extends Layout<IProps> {
    public render() {
        const props = this.props;
        const store = this.rootStore.profileDetails;
        const profile = store.profile;

        return (
            <ProfileView
                certificates={store.certificates}
                getUiText={returnFirstArg}
                className={props.className}
                definitionList={profile.attributes}
                description={profile.description}
                consumerDeals="--"
                consumerAvgTime="--"
                consumerToken="--"
                supplierDeals="--"
                supplierAvgTime="--"
                supplierToken="--"
                my={
                    profile.address.toLowerCase() ===
                    this.rootStore.myProfiles.currentProfileAddress.toLowerCase()
                }
                userName={profile.name}
                countryAbCode2={profile.country}
                logoUrl={profile.logoUrl}
                userStatus={profile.status || 0}
                address={profile.address}
                onNavigateToOrders={props.onNavigateToOrders}
                onNavigateToKyc={this.props.onNavigateToKyc}
            />
        );
    }
}

export const Profile = withRootStore(observer(ProfileLayout));

export default Profile;
