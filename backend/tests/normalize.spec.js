import { normalize } from '../../backend/src/utils/normalize.js'

const RAW_FIXTURE = {
  Auftrags_name: 'Fenster Austausch',
  kundenDaten: { name: 'Anna Fischer', adresse: 'Musterweg 7' },
  faelligkeitsdatum: '05.04.2024',
  preis_total: '7500',
  unnoetigesFeld_1: 'bla bla',
}

test('normalize() liefert einheitliches Objekt', () => {
  const job = normalize(RAW_FIXTURE)

  expect(job).toEqual({
    title: 'Fenster Austausch',
    customer: 'Anna Fischer',
    due: '2024-04-05',
    price: 7500,
    // unnoetigesFeld_* entfernt
  })

  // Zusatzchecks
  expect(typeof job.price).toBe('number')
  expect(job).not.toHaveProperty('unnoetigesFeld_1')
})
