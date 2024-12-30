import { crimes, type Crime } from '@graphique/datasets'
import { bivariateSummary } from '../../../../../test/utils'

type CrimeCount = Crime & {
  count: number
}

const arrestsByDayAndCrime: CrimeCount[] = bivariateSummary({
  data: crimes,
  var1: 'dow',
  var2: 'offenseCategory',
  countAccessor: (d) => d?.count,
})

const arrestsByDay: CrimeCount[] = bivariateSummary({
  data: crimes,
  var1: 'dow',
  countAccessor: (d) => d?.count,
})

export { arrestsByDayAndCrime, arrestsByDay, type CrimeCount }
