import { inject, injectable } from 'inversify'
import { makeObservable, observable, runInAction } from 'mobx'

import type { Currency } from '~currencies/api'
import { currenciesDataSource, CurrenciesDataSource } from '~currencies/data'

export interface CurrenciesListItem {
  id: Currency
  name: string
}

type CurrenciesList = CurrenciesListItem[]

export interface CurrenciesViewModel {
  currencies: CurrenciesList
  loading: boolean
  error: boolean
  refreshing: boolean
  fetchCurrencies: () => Promise<void>
  handleCurrencyPress: (currency: Currency) => void
  keyExtractor: (currencyItem: CurrenciesListItem) => string
  refresh: () => Promise<void>
}

@injectable()
export class ViewModel implements CurrenciesViewModel {
  private dataSource: CurrenciesDataSource

  @observable currencies: CurrenciesList = []
  @observable loading = false
  @observable error = false
  @observable refreshing = false

  fetchCurrencies = async () => {
    runInAction(() => {
      if (this.currencies.length === 0) {
        this.loading = true
      }
      this.error = false
    })

    try {
      const currencies = await this.dataSource.list()
      runInAction(() => {
        this.currencies = Object.entries(currencies).map(([id, name]) => ({
          id,
          name,
        }))
        this.loading = false
      })
    } catch {
      runInAction(() => {
        this.error = true
        this.loading = false
      })
    }
  }

  refresh = async () => {
    runInAction(() => {
      this.refreshing = true
    })
    await this.fetchCurrencies()
    runInAction(() => {
      this.refreshing = false
    })
  }

  handleCurrencyPress = (_currency: Currency) => {
    //
  }

  keyExtractor = (currencyItem: CurrenciesListItem) => `item-${currencyItem.id}`

  constructor(@inject(currenciesDataSource) dataSource: CurrenciesDataSource) {
    this.dataSource = dataSource

    makeObservable(this)
  }
}

export const currenciesViewModel = Symbol.for('CurrenciesViewModel')