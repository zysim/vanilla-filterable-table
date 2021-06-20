import ThFilterable from './ThFilterable.js'

const table = document.querySelector('#table') as HTMLTableElement

enum Type {
  'Coin' = 'Coin',
  'Note' = 'Note',
}

export type Datum = {
  name: string
  type: Type
}

const data: Datum[] = [
  {
    name: 'A',
    type: Type.Coin,
  },
  {
    name: 'B',
    type: Type.Coin,
  },
  {
    name: 'C',
    type: Type.Note,
  },
  {
    name: 'D',
    type: Type.Note,
  },
]

const buildTable = (table: HTMLTableElement, data: Datum[]) => {
  const tHead = table.createTHead().insertRow()

  tHead.insertCell().appendChild(
    new ThFilterable(
      'Name',
      data.map(d => d.name),
      name => {
        filterTable(table, 0, name)
      },
      () => {
        resetTable(table)
      },
    ),
  )
  tHead.insertCell().appendChild(
    new ThFilterable(
      'Type',
      data.map(d => d.type),
      type => {
        filterTable(table, 1, type)
      },
      () => {
        resetTable(table)
      },
    ),
  )

  const tBody = table.createTBody()
  data.map(d => {
    const row = tBody.insertRow()
    const name = row.insertCell()
    name.textContent = d.name
    const type = row.insertCell()
    type.textContent = d.type.toString()
  })
}

const filterTable = (table: HTMLTableElement, col: number, filter?: string) => {
  if (!filter) return
  const tBody = table.tBodies.item(0)
  if (tBody === null) return
  for (let row of tBody.rows) {
    if (row.cells.item(col)?.textContent !== filter.toString()) {
      row.style.display = 'none'
    } else {
      row.style.display = 'table-row'
    }
  }
}

const resetTable = (table: HTMLTableElement) => {
  const tBody = table.tBodies.item(0)
  if (tBody === null) return
  for (let row of tBody.rows) {
    row.style.display = 'table-row'
  }
}

buildTable(table, data)
