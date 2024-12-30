import { penguins, Penguin } from '@graphique/datasets'
import { bivariateSummary } from '../../../../../test/utils'

type PenguinSummary = Penguin & {
  count?: number
}

const beakLengthsBySpecies: PenguinSummary[] = bivariateSummary({
  data: penguins,
  var1: 'species',
  countAccessor: (d) => d?.beakLength!,
  summaryType: 'avg',
})

const flipperLengthsBySpecies: PenguinSummary[] = bivariateSummary({
  data: penguins,
  var1: 'species',
  countAccessor: (d) => d?.flipperLength!,
  summaryType: 'avg',
})

export { beakLengthsBySpecies, flipperLengthsBySpecies, type PenguinSummary }
