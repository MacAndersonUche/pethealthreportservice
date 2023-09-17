import { useRef, useState } from 'react';
import useMainStore from '../../store/store';
import useOnClickOutside from '../hooks/useOnClickOutside';
import { SVGIcon } from './common/icons/SVGIcon';

const getSearchLocationData = async (searchText) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    searchText
  )}&format=json`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.map((result) => ({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      name: result.display_name,
    }));
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

const LocationSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState('');
  const [results, setResults] = useState([]);
  const searchRef = useRef(null);
  const setGeoData = useMainStore((state) => state.setGeoData);

  let debounceTimerRef = useRef(null);

  function handleInputChange(event) {
    const value = event.target.value;
    setValue(value);
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      const searchResult = await getSearchLocationData(value);
      setResults(searchResult.slice(0, 5));
      setIsOpen(searchResult.length > 0);
    }, 500);
  }

  const handleClearInput = () => {
    setValue('');
    setResults([]);
    setIsOpen(false);
  };

  const handleListItemClick = (name, lat, lng) => {
    console.log('Clicked on item:', name, lat, lng);
    setValue(name);
    setIsOpen(false);
    setGeoData({ lat, lng });
  };

  const hideSearch = () => {
    setIsOpen(false);
  };

  useOnClickOutside(searchRef, hideSearch);

  const handleToggleSearch = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      ref={searchRef}
      className="fixed top-8 left-6 right-6 z-[9999] bg-background text-foreground rounded-2xl"
    >
      <div className="relative">
        <div className="flex px-5 py-3 justify-between items-center gap-x-4 rounded-lg">
          <button onClick={handleToggleSearch}>
            {isOpen ? (
              <SVGIcon name="xMarkIcon" />
            ) : (
              <SVGIcon name="magnifyingGlassIcon" />
            )}
          </button>

          <input
            className="w-full pl-2 placeholder:text-foreground/30 rounded-lg"
            type="text"
            placeholder="Search For Place, Location"
            value={value}
            onChange={handleInputChange}
          />
          {value && (
            <button onClick={handleClearInput}>
              <SVGIcon name="xMarkIcon" />
            </button>
          )}
        </div>

        {isOpen && (
          <div className="absolute top-14 left-0 right-0 bg-background border border-solid border-border rounded-b-lg">
            <ul className="list-none p-0">
              {results.map((item) => (
                <li
                  key={item.name}
                  className="px-5 py-2 hover:bg-selected cursor-pointer"
                  onClick={() =>
                    handleListItemClick(item.name, item.lat, item.lng)
                  }
                >
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSearch;
