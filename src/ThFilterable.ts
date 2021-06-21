// @ts-ignore
import Fuse from 'https://cdn.jsdelivr.net/npm/fuse.js@6.4.1/dist/fuse.basic.esm.js'

export type FilterCallback = (type?: string) => void
export type ResetCallback = () => void

class ThFilterable extends HTMLElement {
  filterCallback: FilterCallback
  resetCallback: ResetCallback

  constructor(
    title: string,
    data: string[],
    filterCallback: FilterCallback,
    resetCallback: ResetCallback,
  ) {
    super()
    this.resetCallback = resetCallback
    this.filterCallback = filterCallback
    const shadow = this.attachShadow({ mode: 'open' })
    const container = document.createElement('div')
    container.setAttribute('class', 'container')

    container.innerHTML = `
      <style>
        .container {
          display: flex;
          position: relative;
          justify-content: center;
        }

        .buttonAndFilterListContainer {
          display: flex;
          flex-direction: column;
          position: absolute;
          right: 0.5rem;
        }

        .button {
          width: -moz-fit-content;
          width: fit-content;
          align-self: flex-end;
        }

        .button:hover {
          cursor: pointer;
        }

        .filterListContainer {
          border-collapse: collapse;
          visibility: collapse;
          background: white;
          border: solid 1px black;
          max-height: 50vh;
          max-width: 10vw;
          overflow-x: hidden;
          overflow-y: scroll;
        }

        .filterListContainer.visible {
          visibility: visible;
        }

        .search {
          padding: 1rem;
          font-size: 1rem;
        }

        .filterList {
          list-style: none;
          text-align: left;
          padding: 0;
          margin: 0;
        }

        .filterList:hover {
          cursor: pointer;
        }

        .filterList > li {
          border-bottom: solid 0.5px black;
          padding: 1rem;
        }

        .filterList > li:last-child {
          border: 0;
        }

        .filterList > li:hover {
          background: grey;
        }
      </style>
      ${title}
      <div class="buttonAndFilterListContainer">
        <button class="button" onclick="">&#x25bc;</button>
        <div class="filterListContainer">
          <input type="text" class="search" placeholder="Search..."/>
          <ul class="filterList">
            ${this.createListItemsHtml(data)}
          </ul>
        </div>
      </div>
    `

    shadow.appendChild(container)
  }

  get filterListContainerEl() {
    return (this.shadowRoot as ShadowRoot).querySelector(
      '.filterListContainer',
    ) as HTMLDivElement
  }

  get listItemEls() {
    return (this.shadowRoot as ShadowRoot).querySelectorAll('li')
  }

  get listItemElsWithoutClear() {
    return (this.shadowRoot as ShadowRoot).querySelectorAll(
      'li[data-clear="false"]',
    ) as NodeListOf<HTMLLIElement>
  }

  get toggleButtonEl() {
    return (this.shadowRoot as ShadowRoot).querySelector(
      '.button',
    ) as HTMLButtonElement
  }

  get searchInputEl() {
    return (this.shadowRoot as ShadowRoot).querySelector(
      '.search',
    ) as HTMLInputElement
  }

  connectedCallback() {
    // Add click listeners
    window.addEventListener('click', this.hideDropdown)
    this.shadowRoot?.addEventListener('click', this._hideDropdown)
    this.toggleButtonEl.addEventListener('click', this.toggleDropdown)
    this.listItemEls.forEach((li, i) => {
      li.addEventListener(
        'click',
        !i ? this.resetCallback : this.triggerFilterCallback(li),
      )
      li.addEventListener('click', () => this._hideDropdown(true))
    })

    // Add search listener
    this.searchInputEl.addEventListener('input', this.searchListItems)
  }

  disconnectedCallback() {
    // Remove click listeners
    window.removeEventListener('click', this.hideDropdown)
    this.shadowRoot?.removeEventListener('click', this._hideDropdown)
    this.toggleButtonEl.removeEventListener('click', this.toggleDropdown)
    this.listItemEls.forEach((li, i) => {
      li.removeEventListener(
        'click',
        !i ? this.resetCallback : this.triggerFilterCallback(li),
      )
      li.removeEventListener('click', () => this._hideDropdown(true))
    })

    // Remove search listener
    this.searchInputEl.addEventListener('change', this.searchListItems)
  }

  createListItemsHtml = (data: string[]) =>
    Array.from(
      new Set(
        ['Clear']
          .concat(data)
          .map((d, i) => `<li data-type="${d}" data-clear="${!i}">${d}</li>`),
      ),
    ).join('')

  hideDropdown = (e: MouseEvent) => this._hideDropdown(e.target !== this)

  _hideDropdown = (e: Event | boolean) => {
    if (typeof e === 'boolean') {
      e && this.filterListContainerEl.classList.remove('visible')
    } else if (
      !(e.target as Element).closest('.button') &&
      !(e.target as Element).closest('.filterListContainer')
    ) {
      this.filterListContainerEl.classList.remove('visible')
    }
  }

  searchListItems = (ev: Event) => {
    const inputValue = (ev.target as HTMLInputElement).value
    if (!inputValue.length) {
      this.listItemElsWithoutClear.forEach(li => {
        li.style.display = 'list-item'
      })
      return
    }
    const fuse = new Fuse(this.listItemElsWithoutClear, {
      keys: ['dataset.type'],
    })
    const result = fuse.search(inputValue) as {
      item: HTMLLIElement
    }[]
    this.listItemElsWithoutClear.forEach(li => {
      if (!result.find(r => r.item.dataset.type === li.dataset.type)) {
        li.style.display = 'none'
      }
    })
  }

  toggleDropdown(this: Element, _: Event) {
    this.nextElementSibling?.classList.toggle('visible')
  }

  triggerFilterCallback(li: HTMLLIElement) {
    return () => {
      this.filterCallback(li.dataset.type)
    }
  }
}

customElements.define('th-filterable', ThFilterable)

export default ThFilterable
