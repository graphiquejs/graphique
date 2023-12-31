import { crimes, type Crime } from '@graphique/datasets'
import { bivariateSummary } from '../../../../../test/utils'

type CrimeCount = (Crime & {
  count: number;
})

const arrestsByDayAndCrime: CrimeCount[] = bivariateSummary(crimes, 'dow', 'offenseCategory', d => d?.count)
const arrestsByDay: CrimeCount[] = bivariateSummary(crimes, 'dow', undefined, d => d?.count)

export {
  arrestsByDayAndCrime,
  arrestsByDay,
  type CrimeCount,
}