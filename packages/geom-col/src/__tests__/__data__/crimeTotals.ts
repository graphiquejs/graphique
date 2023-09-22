import { crimes } from '@graphique/datasets'
import { bivariateSummary } from '../../../../../test/utils'

const arrestsByDayAndCrime = bivariateSummary(crimes, 'dow', 'offenseCategory', d => d?.count)
const arrestsByDay = bivariateSummary(crimes, 'dow', undefined, d => d?.count)

export {
  arrestsByDayAndCrime,
  arrestsByDay,
}