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

        .filterContainer {
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

        .filterList {
          border-collapse: collapse;
          visibility: collapse;
          background: white;
          list-style: none;
          text-align: left;
          border: solid 1px black;
          padding: 0;
          margin: 0;
          max-height: 50vh;
          max-width: 10vw;
          overflow-x: hidden;
          overflow-y: scroll;
        }

        .filterList.visible {
          visibility: visible;
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
      <div class="filterContainer">
        <button class="button" onclick="">&#x25bc;</button>
        <ul class="filterList">
          ${this.getListItems(data)}
        </ul>
      </div>
    `

    shadow.appendChild(container)
  }

  connectedCallback() {
    // Add click listeners
    window.addEventListener('click', this.hideDropdown)
    this.getShadowRoot().addEventListener('click', this._hideDropdown)
    this.getShadowRoot()
      .querySelector('.button')
      ?.addEventListener('click', this.toggleDropdown)
    this.getShadowRoot()
      .querySelectorAll('li')
      .forEach((li, i) => {
        li.addEventListener(
          'click',
          !i ? this.resetCallback : this.triggerFilterCallback(li),
        )
      })
  }

  disconnectedCallback() {
    // Remove click listeners
    window.removeEventListener('click', this.hideDropdown)
    this.getShadowRoot().removeEventListener('click', this._hideDropdown)
    this.getShadowRoot()
      .querySelector('.button')
      ?.removeEventListener('click', this.toggleDropdown)
    this.getShadowRoot()
      .querySelectorAll('li')
      .forEach(li =>
        li.removeEventListener('click', this.triggerFilterCallback(li)),
      )
  }

  hideDropdown = (e: MouseEvent) => this._hideDropdown(e.target !== this)

  _hideDropdown = (e: Event | boolean) => {
    if (typeof e === 'boolean') {
      e &&
        this.getShadowRoot()
          .querySelector('.filterList')
          ?.classList.remove('visible')
    } else if (
      !(e.target as Element).closest('.button') &&
      !(e.target as Element).closest('.filterList')
    ) {
      this.getShadowRoot()
        .querySelector('.filterList')
        ?.classList.remove('visible')
    }
  }

  getListItems = (data: string[]) =>
    Array.from(
      new Set(
        ['Clear'].concat(data).map(d => `<li data-type="${d}">${d}</li>`),
      ),
    ).join('')

  getShadowRoot(): ShadowRoot {
    return this.shadowRoot as ShadowRoot
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
