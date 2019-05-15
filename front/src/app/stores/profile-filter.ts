import { observable, computed, action } from 'mobx';
import { EnumProfileRole } from '../api/types';
import { IFilterStore } from './filter-base';
import { EnumProfileStatus } from 'common/types/profile-status';

export interface IOrderFilter {
    status: EnumProfileStatus;
    role: EnumProfileRole;
    country: Array<string>;
    minDeals: number | undefined;
    query: string;
}

export class ProfileFilterStore implements IOrderFilter, IFilterStore {
    @observable
    public userInput: Partial<IOrderFilter> = {
        status: undefined,
        role: undefined,
        country: undefined,
        minDeals: undefined,
        query: '',
    };

    @action
    public updateUserInput(values: Partial<IOrderFilter>) {
        const keys = Object.keys(values) as Array<keyof IOrderFilter>;

        keys.forEach(key => {
            if (!(key in this.userInput)) {
                throw new Error(`Unknown user input ${key}`);
            }

            if (values[key] !== undefined) {
                this.userInput[key] = values[key];
            }
        });
    }

    @computed
    public get status(): EnumProfileStatus {
        return Number(this.userInput.status) || EnumProfileStatus.undefined;
    }

    @computed
    public get role(): EnumProfileRole {
        return Number(this.userInput.role) || EnumProfileRole.undefined;
    }

    @computed
    public get country() {
        return this.userInput.country || [];
    }

    @computed
    public get query() {
        return this.userInput.query || '';
    }

    @computed
    public get minDeals() {
        return this.userInput.minDeals;
    }

    @computed
    public get filter(): any {
        const result: any = {
            status: {
                $gte: this.status,
            },
            role: {
                $eq: this.role,
            },
            country: {
                $in: this.country,
            },
            query: {
                $like: this.query,
            },
        };

        if (this.minDeals) {
            result.minDeals = { $gte: this.minDeals };
        }

        return result;
    }

    @computed
    public get filterAsString(): string {
        return JSON.stringify(this.filter);
    }
}

export default ProfileFilterStore;
