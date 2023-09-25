import { penguins, Penguin } from '@graphique/datasets'
import { bivariateSummary } from '../../../../../test/utils'

type PenguinSummary = Penguin & {
  count?: number
}

const beakLengthsBySpecies: PenguinSummary[] = bivariateSummary(penguins, 'species', undefined, d => d?.beakLength!, 'avg')
const flipperLengthsBySpecies: PenguinSummary[] = bivariateSummary(penguins, 'species', undefined, d => d?.flipperLength!, 'avg')

export {
  beakLengthsBySpecies,
  flipperLengthsBySpecies,
  type PenguinSummary
}