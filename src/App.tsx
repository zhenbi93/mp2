import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, SyntheticEvent } from 'react'
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import './App.css'

type Bean = {
  beanId: number
  groupName: string[]
  ingredients: string[]
  flavorName: string
  description: string
  colorGroup: string
  backgroundColor: string
  imageUrl: string
  glutenFree: boolean
  sugarFree: boolean
  seasonal: boolean
  kosher: boolean
}

type BeansResponse = {
  items: Bean[]
}

type SortKey = 'flavorName' | 'beanId'
type SortDirection = 'asc' | 'desc'
type TasteStatus = 'none' | 'like' | 'dislike' | 'wish'
type CollectionView = 'list' | 'gallery'

type BeanMemory = {
  tried: boolean
  status: TasteStatus
}

type Profile = {
  name: string
}

type LuckyDraw = {
  date: string
  beanId: number
}

const API_URL = 'https://jellybellywikiapi.onrender.com/api/Beans?pageIndex=1&pageSize=114'
const PROFILE_KEY = 'jelly-atlas-profile'
const MEMORY_KEY = 'jelly-atlas-bean-memory'
const LUCKY_KEY = 'jelly-atlas-lucky-draw'
const GALLERY_PAGE_SIZE = 20

const fallbackBeans: Bean[] = [
  {
    beanId: 1,
    groupName: ['Jelly Belly Official Flavors', 'Soda Pop Shoppe Flavors'],
    ingredients: ['Sugar', 'Corn Syrup', 'Modified Food Starch', 'Citric Acid', 'Natural & Artificial Flavor'],
    flavorName: '7Up',
    description: 'The refreshing and crisp flavor of lemon lime soda.',
    colorGroup: 'khaki',
    backgroundColor: '#CEDC91',
    imageUrl: 'https://cdn-tp1.mozu.com/9046-m1/cms/files/ab692677-5471-4863-91a8-659363ae4cc4',
    glutenFree: false,
    sugarFree: false,
    seasonal: false,
    kosher: true,
  },
  {
    beanId: 2,
    groupName: ['Jelly Belly Official Flavors', 'Soda Pop Shoppe Flavors'],
    ingredients: ['Sugar', 'Corn Syrup', 'Modified Food Starch', 'Natural And Artificial Flavors'],
    flavorName: 'A&W Cream Soda',
    description: 'A deliciously creamy take on the classic vanilla flavor.',
    colorGroup: 'gainsboro',
    backgroundColor: '#E1DFE1',
    imageUrl: 'https://cdn-tp1.mozu.com/9046-m1/cms/files/75fea694-ed38-4e84-a86e-182e31ea5a7b',
    glutenFree: false,
    sugarFree: false,
    seasonal: false,
    kosher: true,
  },
  {
    beanId: 3,
    groupName: ['Jelly Belly Official Flavors', 'Soda Pop Shoppe Flavors'],
    ingredients: ['Sugar', 'Corn Syrup', 'Modified Food Starch', 'Natural & Artificial Flavors'],
    flavorName: 'A&W Root Beer',
    description: 'Say cheers with the flavor of this all-American classic drink.',
    colorGroup: 'saddlebrown',
    backgroundColor: '#792E27',
    imageUrl: 'https://cdn-tp1.mozu.com/9046-m1/cms/files/63b9e71d-9866-4044-9af7-7a64a52b0e0e',
    glutenFree: false,
    sugarFree: false,
    seasonal: false,
    kosher: true,
  },
  {
    beanId: 4,
    groupName: ['Superfruit Flavors'],
    ingredients: ['Cane Sugar', 'Tapioca Syrup', 'Modified Food Starch', 'Acai Puree', 'Natural Flavors'],
    flavorName: 'Acai Berry',
    description: 'A super sweet and rich berry taste unlike any other.',
    colorGroup: 'darkslategray',
    backgroundColor: '#5B3640',
    imageUrl: 'https://cdn-tp1.mozu.com/9046-m1/cms/files/6f0c6164-71c8-47f6-a55f-893f5fd58fa0',
    glutenFree: false,
    sugarFree: false,
    seasonal: false,
    kosher: true,
  },
  {
    beanId: 5,
    groupName: ['Cold Stone Flavors'],
    ingredients: ['Sugar', 'Corn Syrup', 'Modified Food Starch', 'Strawberry Puree', 'Chocolate Liquor'],
    flavorName: 'Apple Pie A La Cold Stone',
    description: 'French vanilla, apple pie, and caramel flavors in a dessert-inspired bean.',
    colorGroup: 'burlywood',
    backgroundColor: '#F0C57F',
    imageUrl: 'https://cdn-tp1.mozu.com/9046-m1/cms/files/81f5ecb8-250b-403f-a1bf-89fb6e47dd0d',
    glutenFree: false,
    sugarFree: false,
    seasonal: false,
    kosher: true,
  },
  {
    beanId: 6,
    groupName: ['Superfruit Flavors'],
    ingredients: ['Cane Sugar', 'Tapioca Syrup', 'Modified Food Starch', 'Acerola Cherry Juice'],
    flavorName: 'Barbados Cherry',
    description: 'A sweet cherry flavor with just a hint of tartness.',
    colorGroup: 'lightpink',
    backgroundColor: '#E798AB',
    imageUrl: 'https://cdn-tp1.mozu.com/9046-m1/cms/files/168244d0-b3ba-4725-a2d9-5083b362d10a',
    glutenFree: false,
    sugarFree: false,
    seasonal: false,
    kosher: true,
  },
  {
    beanId: 7,
    groupName: ['Jelly Belly Official Flavors'],
    ingredients: ['Sugar', 'Corn Syrup', 'Modified Food Starch', 'Blueberry Juice From Puree'],
    flavorName: 'Blueberry',
    description: 'The taste of fresh-picked blueberries, flavored with real blueberry puree.',
    colorGroup: 'steelblue',
    backgroundColor: '#3A7195',
    imageUrl: 'https://cdn-tp1.mozu.com/9046-m1/cms/files/a8f085b5-b4ff-4aca-8650-43ad54c80fe4',
    glutenFree: false,
    sugarFree: false,
    seasonal: false,
    kosher: true,
  },
  {
    beanId: 8,
    groupName: ['Jelly Belly Official Flavors', 'Kids Mix Flavors'],
    ingredients: ['Sugar', 'Corn Syrup', 'Modified Food Starch', 'Artificial Flavor'],
    flavorName: 'Bubble Gum',
    description: 'This bean has everything but the bubble.',
    colorGroup: 'lightpink',
    backgroundColor: '#E3ACBD',
    imageUrl: 'https://cdn-tp1.mozu.com/9046-m1/cms/files/51474130-73e9-40b7-a8ba-c9eac7be7de4',
    glutenFree: false,
    sugarFree: false,
    seasonal: false,
    kosher: true,
  },
  {
    beanId: 9,
    groupName: ['Jelly Belly Official Flavors', 'Kids Mix Flavors'],
    ingredients: ['Sugar', 'Corn Syrup', 'Modified Food Starch', 'Natural And Artificial Flavors'],
    flavorName: 'Buttered Popcorn',
    description: 'Buttery perfection without having to go to the movies.',
    colorGroup: 'gold',
    backgroundColor: '#F6D334',
    imageUrl: 'https://cdn-tp1.mozu.com/9046-m1/cms/files/61207309-fffb-443a-b735-b9a5a6374c8d',
    glutenFree: false,
    sugarFree: false,
    seasonal: false,
    kosher: true,
  },
  {
    beanId: 10,
    groupName: ['Jelly Belly Official Flavors', 'Tropical Mix Flavors'],
    ingredients: ['Sugar', 'Corn Syrup', 'Modified Food Starch', 'Cantaloupe Juice'],
    flavorName: 'Cantaloupe',
    description: 'This sweet summertime favorite is always in season.',
    colorGroup: 'goldenrod',
    backgroundColor: '#FAA538',
    imageUrl: 'https://cdn-tp1.mozu.com/9046-m1/cms/files/45d0972c-e554-4374-8b21-ac50ff450d3e',
    glutenFree: false,
    sugarFree: false,
    seasonal: false,
    kosher: true,
  },
  {
    beanId: 11,
    groupName: ['Jelly Belly Official Flavors'],
    ingredients: ['Sugar', 'Corn Syrup', 'Modified Food Starch', 'Coffee'],
    flavorName: 'Cappuccino',
    description: 'The rich and creamy taste of cappuccino, flavored with real coffee.',
    colorGroup: 'saddlebrown',
    backgroundColor: '#5A262A',
    imageUrl: 'https://cdn-tp1.mozu.com/9046-m1/cms/files/ca2fe8be-4c41-4e83-81df-cf3b093f5a42',
    glutenFree: false,
    sugarFree: false,
    seasonal: false,
    kosher: true,
  },
  {
    beanId: 12,
    groupName: ['Jelly Belly Official Flavors'],
    ingredients: ['Sugar', 'Corn Syrup', 'Modified Food Starch', 'Salt'],
    flavorName: 'Caramel Corn',
    description: 'Sweet caramel and buttery popcorn in one bright bite.',
    colorGroup: 'burlywood',
    backgroundColor: '#F0C57F',
    imageUrl: 'https://cdn-tp1.mozu.com/9046-m1/cms/files/aff9adae-5dde-4e5b-b718-a68d7ed8edf2',
    glutenFree: false,
    sugarFree: false,
    seasonal: false,
    kosher: true,
  },
  {
    beanId: 14,
    groupName: ['Cold Stone Flavors'],
    ingredients: ['Sugar', 'Corn Syrup', 'Modified Food Starch', 'Cocoa Powder'],
    flavorName: 'Chocolate Devotion',
    description: 'Rich chocolate taste flavored with real cocoa powder.',
    colorGroup: 'saddlebrown',
    backgroundColor: '#792E27',
    imageUrl: 'https://cdn-tp1.mozu.com/9046-m1/cms/files/f7cc6aee-9e70-466f-8d5a-a173b4a42275',
    glutenFree: false,
    sugarFree: false,
    seasonal: false,
    kosher: true,
  },
  {
    beanId: 16,
    groupName: ['Jelly Belly Official Flavors'],
    ingredients: ['Sugar', 'Corn Syrup', 'Modified Food Starch', 'Artificial Flavor'],
    flavorName: 'Cinnamon',
    description: 'Sugar and spice with just the right amount of cinnamon.',
    colorGroup: 'indianred',
    backgroundColor: '#DD4B62',
    imageUrl: 'https://cdn-tp1.mozu.com/9046-m1/cms/files/18e50750-75eb-4f26-b8ed-1c01db69f3d3',
    glutenFree: false,
    sugarFree: false,
    seasonal: false,
    kosher: true,
  },
]

const defaultProfile: Profile = {
  name: 'Guest Collector',
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function toneClass(colorGroup: string) {
  return `tone-${colorGroup.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

function sortBeans(beans: Bean[], sortKey: SortKey, sortDirection: SortDirection) {
  return [...beans].sort((firstBean, secondBean) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1
    const firstValue = firstBean[sortKey]
    const secondValue = secondBean[sortKey]

    if (typeof firstValue === 'number' && typeof secondValue === 'number') {
      return (firstValue - secondValue) * multiplier
    }

    return String(firstValue).localeCompare(String(secondValue)) * multiplier
  })
}

function getMemory(memory: Record<number, BeanMemory>, beanId: number): BeanMemory {
  return memory[beanId] ?? { tried: false, status: 'none' }
}

function flavorInitials(flavorName: string) {
  return flavorName
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

function handleImageError(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.hidden = true
  event.currentTarget.parentElement?.classList.add('image-missing')
}

function BeanImage({ bean }: { bean: Bean }) {
  return (
    <span className={`bean-visual ${toneClass(bean.colorGroup)}`} aria-label={`${bean.flavorName} image`}>
      <img src={bean.imageUrl} alt={bean.flavorName} onError={handleImageError} />
      <span className="bean-initials" aria-hidden="true">
        {flavorInitials(bean.flavorName)}
      </span>
    </span>
  )
}

function App() {
  const [beans, setBeans] = useState<Bean[]>(fallbackBeans)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<Profile>(() => readStorage(PROFILE_KEY, defaultProfile))
  const [memory, setMemory] = useState<Record<number, BeanMemory>>(() => readStorage(MEMORY_KEY, {}))
  const [luckyDraw, setLuckyDraw] = useState<LuckyDraw | null>(() => readStorage<LuckyDraw | null>(LUCKY_KEY, null))

  useEffect(() => {
    axios
      .get<BeansResponse>(API_URL)
      .then((response) => {
        if (response.data.items.length > 0) {
          setBeans(response.data.items)
        }
        setError('')
      })
      .catch(() => {
        setError('Live API could not be reached, so the app is showing a curated Jelly Belly sample set.')
      })
  }, [])

  useEffect(() => {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  }, [profile])

  useEffect(() => {
    window.localStorage.setItem(MEMORY_KEY, JSON.stringify(memory))
  }, [memory])

  useEffect(() => {
    window.localStorage.setItem(LUCKY_KEY, JSON.stringify(luckyDraw))
  }, [luckyDraw])

  function updateMemory(beanId: number, patch: Partial<BeanMemory>) {
    setMemory((currentMemory) => ({
      ...currentMemory,
      [beanId]: {
        ...getMemory(currentMemory, beanId),
        ...patch,
      },
    }))
  }

  function drawLuckyBean() {
    if (luckyDraw?.date === todayKey() || beans.length === 0) {
      return
    }

    const randomBean = beans[Math.floor(Math.random() * beans.length)]
    setLuckyDraw({ date: todayKey(), beanId: randomBean.beanId })
  }

  function resetProfile() {
    setProfile(defaultProfile)
    setMemory({})
    setLuckyDraw(null)
  }

  return (
    <div className="app-shell">
      {error && <p className="status-banner">{error}</p>}

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              beans={beans}
              drawLuckyBean={drawLuckyBean}
              luckyDraw={luckyDraw}
              memory={memory}
              profile={profile}
              resetProfile={resetProfile}
              setProfile={setProfile}
              updateMemory={updateMemory}
            />
          }
        />
        <Route path="/bean/:beanId" element={<DetailPage beans={beans} memory={memory} updateMemory={updateMemory} />} />
      </Routes>
    </div>
  )
}

type HomePageProps = {
  beans: Bean[]
  drawLuckyBean: () => void
  luckyDraw: LuckyDraw | null
  memory: Record<number, BeanMemory>
  profile: Profile
  resetProfile: () => void
  setProfile: (profile: Profile) => void
  updateMemory: (beanId: number, patch: Partial<BeanMemory>) => void
}

function HomePage({
  beans,
  drawLuckyBean,
  luckyDraw,
  memory,
  profile,
  resetProfile,
  setProfile,
  updateMemory,
}: HomePageProps) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('flavorName')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])

  const luckyBean = useMemo(
    () => beans.find((bean) => bean.beanId === luckyDraw?.beanId) ?? null,
    [beans, luckyDraw],
  )

  const alreadyDrewToday = luckyDraw?.date === todayKey()

  const allGroups = useMemo(() => {
    const groups = new Set<string>()
    beans.forEach((bean) => bean.groupName.forEach((group) => groups.add(group)))
    return [...groups].sort((firstGroup, secondGroup) => firstGroup.localeCompare(secondGroup)).slice(0, 12)
  }, [beans])

  const filteredBeans = useMemo(() => {
    const searchTerm = normalizeText(query)
    const searchedBeans = beans.filter((bean) => {
      const haystack = normalizeText(`${bean.flavorName} ${bean.beanId}`)
      return haystack.includes(searchTerm)
    })
    const matchingBeans =
      sortKey === 'flavorName' && selectedGroups.length > 0
        ? searchedBeans.filter((bean) => selectedGroups.some((group) => bean.groupName.includes(group)))
        : searchedBeans

    return sortBeans(matchingBeans, sortKey, sortDirection)
  }, [beans, query, selectedGroups, sortDirection, sortKey])

  const stats = useMemo(() => {
    const memories = Object.values(memory)
    return {
      tried: memories.filter((item) => item.tried).length,
      liked: memories.filter((item) => item.status === 'like').length,
      wished: memories.filter((item) => item.status === 'wish').length,
    }
  }, [memory])

  function clearFilters() {
    setQuery('')
    setSortKey('flavorName')
    setSortDirection('asc')
    setSelectedGroups([])
  }

  function toggleGroup(group: string) {
    setSelectedGroups((currentGroups) =>
      currentGroups.includes(group)
        ? currentGroups.filter((currentGroup) => currentGroup !== group)
        : [...currentGroups, group],
    )
  }

  return (
    <main>
      <HeaderBar />
      <LuckyDrawSection
        alreadyDrewToday={alreadyDrewToday}
        beans={beans}
        drawLuckyBean={drawLuckyBean}
        luckyBean={luckyBean}
      />

      <CollectionSection
        allGroups={allGroups}
        clearFilters={clearFilters}
        filteredBeans={filteredBeans}
        memory={memory}
        query={query}
        selectedGroups={selectedGroups}
        setQuery={setQuery}
        setSortDirection={setSortDirection}
        setSortKey={setSortKey}
        sortDirection={sortDirection}
        sortKey={sortKey}
        toggleGroup={toggleGroup}
        updateMemory={updateMemory}
      />

      <ProfileSection
        beans={beans}
        profile={profile}
        resetProfile={resetProfile}
        setProfile={setProfile}
        stats={stats}
      />
    </main>
  )
}

function HeaderBar() {
  return (
    <header className="app-headbar" aria-label="Page navigation">
      <Link className="headbar-link" to="/#lucky-draw">
        Luck Draw
      </Link>
      <Link className="headbar-link headbar-primary" to="/#collection">
        Explore More
      </Link>
      <Link className="headbar-icon-link" to="/#profile" aria-label="Collector profile">
        <span className="profile-icon" aria-hidden="true"></span>
      </Link>
    </header>
  )
}

function LuckyDrawSection({
  alreadyDrewToday,
  beans,
  drawLuckyBean,
  luckyBean,
}: {
  alreadyDrewToday: boolean
  beans: Bean[]
  drawLuckyBean: () => void
  luckyBean: Bean | null
}) {
  const windowBeans = beans.slice(0, 22)

  return (
    <section className="page-section lucky-section" id="lucky-draw" aria-label="Lucky draw candy bag">
      <div className="lucky-layout">
        <div className={luckyBean ? 'candy-bag is-open' : 'candy-bag'} aria-label="Daily candy bag">
          <div className="bag-crimp bag-crimp-top"></div>
          <button className="tear-button" type="button" onClick={drawLuckyBean} disabled={alreadyDrewToday}>
            <span></span>
            {!alreadyDrewToday && 'OPEN'}
          </button>
          <div className="bag-brand">
            <strong>Jelly Belly</strong>
          </div>
          <div className="bag-body">
            <div className="candy-window" aria-hidden="true">
              {windowBeans.map((bean, index) => (
                <span
                  className={`window-candy ${toneClass(bean.colorGroup)}`}
                  key={`${bean.beanId}-${index}`}
                ></span>
              ))}
            </div>
            <strong>Daily Lucky Flavor</strong>
            <small>one draw per day</small>
          </div>
          <div className="bag-crimp bag-crimp-bottom"></div>
        </div>
        <aside className="lucky-side" aria-live="polite">
          {luckyBean ? (
            <Link to={`/bean/${luckyBean.beanId}`} className={`lucky-bean ${toneClass(luckyBean.colorGroup)}`}>
              <BeanImage bean={luckyBean} />
              <span>{luckyBean.flavorName}</span>
              <small>Come back tomorrow and try again.</small>
            </Link>
          ) : (
            <p>Try drawing your lucky flavor today.</p>
          )}
        </aside>
      </div>
    </section>
  )
}

type CollectionSectionProps = {
  allGroups: string[]
  clearFilters: () => void
  filteredBeans: Bean[]
  memory: Record<number, BeanMemory>
  query: string
  selectedGroups: string[]
  setQuery: (query: string) => void
  setSortDirection: (sortDirection: SortDirection) => void
  setSortKey: (sortKey: SortKey) => void
  sortDirection: SortDirection
  sortKey: SortKey
  toggleGroup: (group: string) => void
  updateMemory: (beanId: number, patch: Partial<BeanMemory>) => void
}

function CollectionSection({
  allGroups,
  clearFilters,
  filteredBeans,
  memory,
  query,
  selectedGroups,
  setQuery,
  setSortDirection,
  setSortKey,
  sortDirection,
  sortKey,
  toggleGroup,
  updateMemory,
}: CollectionSectionProps) {
  const [collectionView, setCollectionView] = useState<CollectionView>('gallery')
  const [galleryPage, setGalleryPage] = useState(1)
  const totalGalleryPages = Math.max(1, Math.ceil(filteredBeans.length / GALLERY_PAGE_SIZE))
  const currentGalleryPage = Math.min(galleryPage, totalGalleryPages)
  const galleryPageBeans = filteredBeans.slice(
    (currentGalleryPage - 1) * GALLERY_PAGE_SIZE,
    currentGalleryPage * GALLERY_PAGE_SIZE,
  )

  return (
    <section className="page-section collection-section" id="collection" aria-labelledby="collection-title">
      <div className="section-heading">
        <div>
          <h2 id="collection-title">Explore More Flavors</h2>
        </div>
        <button
          className="ghost-button"
          type="button"
          onClick={() => {
            setGalleryPage(1)
            clearFilters()
          }}
        >
          Reset filters
        </button>
      </div>

      <form className="controls" onSubmit={(event: FormEvent) => event.preventDefault()}>
        <label>
          <span>Search</span>
          <input
            value={query}
            onChange={(event) => {
              setGalleryPage(1)
              setQuery(event.target.value)
            }}
            placeholder="Search flavor or bean number..."
            type="search"
          />
        </label>
      </form>

      <div className="collection-toolbar">
        <div className="view-switch" aria-label="Choose collection view">
          <button
            className={collectionView === 'gallery' ? 'is-active' : ''}
            type="button"
            onClick={() => setCollectionView('gallery')}
          >
            Gallery View
          </button>
          <button
            className={collectionView === 'list' ? 'is-active' : ''}
            type="button"
            onClick={() => setCollectionView('list')}
          >
            List View
          </button>
        </div>

        <div className="sort-controls" aria-label="Sort controls">
          <label className="compact-select">
            <span>Sort by:</span>
            <select
              value={sortKey}
              onChange={(event) => {
                setGalleryPage(1)
                setSortKey(event.target.value as SortKey)
              }}
            >
              <option value="flavorName">Flavor</option>
              <option value="beanId">Bean #</option>
            </select>
          </label>
          <label className="compact-select">
            <span>Order:</span>
            <select
              value={sortDirection}
              onChange={(event) => {
                setGalleryPage(1)
                setSortDirection(event.target.value as SortDirection)
              }}
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </label>
        </div>
      </div>

      {sortKey === 'flavorName' && (
        <div className="flavor-options" aria-label="Flavor filters">
          {allGroups.map((group) => (
            <button
              className={selectedGroups.includes(group) ? 'flavor-chip is-active' : 'flavor-chip'}
              key={group}
              onClick={() => {
                setGalleryPage(1)
                toggleGroup(group)
              }}
              type="button"
            >
              {group}
            </button>
          ))}
        </div>
      )}

      <div className="collection-grid">
        {collectionView === 'list' ? (
          <div className="list-panel panel">
            <div className="mini-heading">
              <strong>List View</strong>
              <span>{filteredBeans.length} results</span>
            </div>
            <div className="result-list">
              {filteredBeans.map((bean) => {
                const beanMemory = getMemory(memory, bean.beanId)

                return (
                  <article className="result-row" key={bean.beanId}>
                    <Link to={`/bean/${bean.beanId}`} className="result-main">
                      <span className={`color-dot ${toneClass(bean.colorGroup)}`} aria-hidden="true"></span>
                      <span>
                        <strong>{bean.flavorName}</strong>
                        <small>{bean.groupName.slice(0, 2).join(' / ')}</small>
                      </span>
                      <span className="bean-number">#{bean.beanId}</span>
                    </Link>
                    <CollectorControls bean={bean} beanMemory={beanMemory} updateMemory={updateMemory} />
                  </article>
                )
              })}
              {filteredBeans.length === 0 && <p className="empty-state">No flavors match that search.</p>}
            </div>
          </div>
        ) : (
          <div className="gallery-panel panel">
            <div className="mini-heading">
              <strong>Gallery View</strong>
              <span>
                {filteredBeans.length === 0
                  ? '0 flavors'
                  : `${(currentGalleryPage - 1) * GALLERY_PAGE_SIZE + 1}-${Math.min(
                      currentGalleryPage * GALLERY_PAGE_SIZE,
                      filteredBeans.length,
                    )} of ${filteredBeans.length}`}
              </span>
            </div>
            <div className="gallery-grid">
              {galleryPageBeans.map((bean) => {
                const beanMemory = getMemory(memory, bean.beanId)

                return (
                  <article className={`bean-card ${toneClass(bean.colorGroup)}`} key={bean.beanId}>
                    <Link to={`/bean/${bean.beanId}`} className="bean-card-link">
                      <BeanImage bean={bean} />
                      <strong>{bean.flavorName}</strong>
                    </Link>
                    <CollectorControls bean={bean} beanMemory={beanMemory} updateMemory={updateMemory} compact />
                  </article>
                )
              })}
              {filteredBeans.length === 0 && (
                <p className="empty-state">Choose another filter to refill the candy shelf.</p>
              )}
            </div>
            {filteredBeans.length > GALLERY_PAGE_SIZE && (
              <div className="gallery-pager" aria-label="Gallery pagination">
                <button
                  type="button"
                  onClick={() => setGalleryPage((currentPage) => Math.max(1, currentPage - 1))}
                  disabled={currentGalleryPage === 1}
                >
                  Previous
                </button>
                <span>
                  Page {currentGalleryPage} / {totalGalleryPages}
                </span>
                <button
                  type="button"
                  onClick={() => setGalleryPage((currentPage) => Math.min(totalGalleryPages, currentPage + 1))}
                  disabled={currentGalleryPage === totalGalleryPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function CollectorControls({
  bean,
  beanMemory,
  compact = false,
  showReactions = false,
  updateMemory,
}: {
  bean: Bean
  beanMemory: BeanMemory
  compact?: boolean
  showReactions?: boolean
  updateMemory: (beanId: number, patch: Partial<BeanMemory>) => void
}) {
  function toggleTried() {
    const nextTried = !beanMemory.tried
    const nextStatus =
      (nextTried && beanMemory.status === 'wish') || (!nextTried && ['like', 'dislike'].includes(beanMemory.status))
        ? 'none'
        : beanMemory.status

    updateMemory(bean.beanId, { tried: nextTried, status: nextStatus as TasteStatus })
  }

  function toggleWish() {
    updateMemory(bean.beanId, {
      tried: beanMemory.status === 'wish' ? beanMemory.tried : false,
      status: beanMemory.status === 'wish' ? 'none' : 'wish',
    })
  }

  return (
    <div className={compact ? 'collector-controls is-compact' : 'collector-controls'}>
      <button
        className={beanMemory.tried ? 'taste-button is-active' : 'taste-button'}
        aria-label={beanMemory.tried ? 'Mark as not tasted' : 'Mark as tasted'}
        onClick={toggleTried}
        type="button"
      >
        <span aria-hidden="true">{beanMemory.tried ? '✓' : '○'}</span>
        {beanMemory.tried ? 'Tasted' : 'Taste'}
      </button>
      <button
        className={beanMemory.status === 'wish' ? 'taste-button is-active' : 'taste-button'}
        aria-label={beanMemory.status === 'wish' ? 'Remove from wish list' : 'Add to wish list'}
        onClick={toggleWish}
        type="button"
      >
        <span aria-hidden="true">{beanMemory.status === 'wish' ? '★' : '☆'}</span>
        Wish
      </button>
      {showReactions && beanMemory.tried && (
        <div className="reaction-controls">
          {(['like', 'dislike'] as TasteStatus[]).map((status) => (
            <button
              className={beanMemory.status === status ? 'taste-button is-active' : 'taste-button'}
              key={status}
              onClick={() => updateMemory(bean.beanId, { status: beanMemory.status === status ? 'none' : status })}
              type="button"
            >
              <span aria-hidden="true">{status === 'like' ? '♡' : '−'}</span>
              {status}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ProfileSection({
  beans,
  profile,
  resetProfile,
  setProfile,
  stats,
}: {
  beans: Bean[]
  profile: Profile
  resetProfile: () => void
  setProfile: (profile: Profile) => void
  stats: { tried: number; liked: number; wished: number }
}) {
  return (
    <section className="page-section profile-section" id="profile" aria-labelledby="profile-title">
      <div className="profile-layout">
        <form className="profile-card panel" onSubmit={(event) => event.preventDefault()}>
          <h2 className="visually-hidden" id="profile-title">
            User profile
          </h2>
          <label className="user-name-field">
            <span>User Name</span>
            <input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
          </label>
          <button className="ghost-button" type="button" onClick={resetProfile}>
            Clear local data
          </button>
        </form>

        <div className="profile-summary">
          <article>
            <strong>{stats.tried}</strong>
            <span>tried</span>
          </article>
          <article>
            <strong>{stats.liked}</strong>
            <span>liked</span>
          </article>
          <article>
            <strong>{stats.wished}</strong>
            <span>wishlist</span>
          </article>
          <article>
            <strong>{beans.length}</strong>
            <span>total flavors</span>
          </article>
        </div>
      </div>
    </section>
  )
}

function DetailPage({
  beans,
  memory,
  updateMemory,
}: {
  beans: Bean[]
  memory: Record<number, BeanMemory>
  updateMemory: (beanId: number, patch: Partial<BeanMemory>) => void
}) {
  const { beanId } = useParams()
  const navigate = useNavigate()
  const sortedBeans = useMemo(() => sortBeans(beans, 'beanId', 'asc'), [beans])
  const currentIndex = sortedBeans.findIndex((bean) => bean.beanId === Number(beanId))
  const bean = sortedBeans[currentIndex]

  useEffect(() => {
    if (!bean && sortedBeans.length > 0) {
      navigate('/', { replace: true })
    }
  }, [bean, navigate, sortedBeans.length])

  if (!bean) {
    return null
  }

  const previousBean = sortedBeans[(currentIndex - 1 + sortedBeans.length) % sortedBeans.length]
  const nextBean = sortedBeans[(currentIndex + 1) % sortedBeans.length]
  const beanMemory = getMemory(memory, bean.beanId)
  const traits = [
    bean.kosher ? 'Kosher' : 'Not kosher',
    bean.glutenFree ? 'Gluten free' : 'Contains gluten',
    bean.sugarFree ? 'Sugar free' : 'Sugar included',
    bean.seasonal ? 'Seasonal' : 'Year-round',
  ]

  return (
    <main className="detail-page">
      <Link to="/" className="back-link">
        &lt; Back to collection
      </Link>

      <section className={`detail-hero ${toneClass(bean.colorGroup)}`}>
        <div className="detail-image">
          <BeanImage bean={bean} />
        </div>
        <div className="detail-copy">
          <p className="eyebrow">Bean #{bean.beanId}</p>
          <h1>{bean.flavorName}</h1>
          <p>{bean.description}</p>
          <CollectorControls bean={bean} beanMemory={beanMemory} updateMemory={updateMemory} showReactions />
        </div>
      </section>

      <section className="detail-grid">
        <article className="panel">
          <p className="eyebrow">Details</p>
          <h2>Bean profile</h2>
          <dl className="spec-list">
            <div>
              <dt>Groups</dt>
              <dd>{bean.groupName.join(', ')}</dd>
            </div>
            <div>
              <dt>Saved status</dt>
              <dd>{beanMemory.status === 'none' ? 'unmarked' : beanMemory.status}</dd>
            </div>
          </dl>
          <div className="trait-grid">
            {traits.map((trait) => (
              <span key={trait}>{trait}</span>
            ))}
          </div>
        </article>

        <article className="panel">
          <p className="eyebrow">Ingredients</p>
          <h2>Flavor formula</h2>
          <p className="ingredient-copy">{bean.ingredients.slice(0, 14).join(', ')}.</p>
        </article>
      </section>

      <nav className="pager" aria-label="Bean detail navigation">
        <Link to={`/bean/${previousBean.beanId}`} className="pager-link">
          <span>&lt; Previous</span>
          <strong>{previousBean.flavorName}</strong>
        </Link>
        <Link to={`/bean/${nextBean.beanId}`} className="pager-link">
          <span>Next &gt;</span>
          <strong>{nextBean.flavorName}</strong>
        </Link>
      </nav>
    </main>
  )
}

export default App
