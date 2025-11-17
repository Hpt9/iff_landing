import "./App.css";

import logo2 from "../public/logo2.svg";
import { Card } from "./components/card";
import { IoIosPhonePortrait } from "react-icons/io";

import { FaInstagram } from "react-icons/fa";
import { FaFacebookF } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { TbCalendarFilled } from "react-icons/tb";
import { IoLocationOutline } from "react-icons/io5";
import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoIosClose } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { registerLocale } from "react-datepicker";
import az from "date-fns/locale/az";
registerLocale("az", az);

function formatDateToYMDLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function App() {
  // API data states
  const [eventData, setEventData] = useState([]);
  const [eventsByCategory, setEventsByCategory] = useState([]);
  const [rightNowEvents, setRightNowEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Settings states
  const [settings, setSettings] = useState({
    
    button_text: "Son Tədbir haqqında",
    cover_image: "../public/cover.svg",
    phone: "+994 51 634 85 96",
    location: "Azərbaycan, Bakı şəhəri, Xocalı prospekti, İbis Hotel",
    fb: "https://www.facebook.com/iif.birgekod.az",
    instagram: "https://www.instagram.com/iif.birgekod.az",
    youtube: "https://www.youtube.com/@iif.birgekod"
  });

  // Pending (input) states
  const [pendingSearch, setPendingSearch] = useState("");
  const [pendingDate, setPendingDate] = useState(null);
  const [pendingLocation, setPendingLocation] = useState(null);

  // Active (applied) states
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(window.innerWidth < 1024 ? 6 : 12);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // string or null
  const dateIconRef = useRef(null);
  const [showLocationDropdownMobile, setShowLocationDropdownMobile] = useState(false);
  const [showLocationDropdownDesktop, setShowLocationDropdownDesktop] = useState(false);
  const locationDropdownRefMobile = useRef(null);
  const locationDropdownRefDesktop = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Fetch settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("https://iifapi.tw1.ru/api/settings");
        
        if (!response.ok) {
          throw new Error("Failed to fetch settings");
        }
        
        const result = await response.json();
        
        // Transform settings array to object
        const settingsObj = {};
        if (Array.isArray(result)) {
          result.forEach((item) => {
            settingsObj[item.key] = item.value;
          });
        }
        
        setSettings((prev) => ({
          ...prev,
          ...settingsObj
        }));
      } catch (err) {
        console.error("Error fetching settings:", err);
        // Keep default values on error
      }
    };
    
    fetchSettings();
  }, []);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("https://iifapi.tw1.ru/api/events");
        
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        
        const result = await response.json();
        
        // Transform API data to match expected format
        const transformedEvents = [];
        const categorizedEvents = [];
        const upcomingEvents = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (result.data && Array.isArray(result.data)) {
          result.data.forEach((category) => {
            if (category.events && Array.isArray(category.events)) {
              const categoryEvents = [];
              
              category.events.forEach((event, index) => {
                const eventDate = new Date(event.date);
                eventDate.setHours(0, 0, 0, 0);
                
                const transformedEvent = {
                  id: `${category.name}-${index}`,
                  title: event.address_name,
                  date: event.date,
                  time: event.time,
                  imagePath: event.photo,
                  link: event.url,
                  location: event.address_name,
                  category: category.name,
                };
                
                transformedEvents.push(transformedEvent);
                categoryEvents.push(transformedEvent);
                
                // Add all events from "Yeni Tədbir" category to upcoming events
                if (category.name === "Yeni Tədbir") {
                  upcomingEvents.push(transformedEvent);
                }
              });
              
              // Store category with its events
              if (categoryEvents.length > 0) {
                categorizedEvents.push({
                  name: category.name,
                  events: categoryEvents.sort((a, b) => new Date(b.date) - new Date(a.date))
                });
              }
            }
          });
        }
        
        setEventData(transformedEvents);
        setEventsByCategory(categorizedEvents);
        setRightNowEvents(upcomingEvents);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  // Sort events by date descending and get the latest event
  const sortedEvents = [...eventData].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  const latestEvent = sortedEvents[0];
  const latestPastEvent = sortedEvents.find(
    (event) => event.category !== "Yeni Tədbir"
  );
  const buttonEvent = latestPastEvent || latestEvent;

  // When user clicks Axtar
  const applyFilters = () => {
    setSearch(pendingSearch);
    setSelectedDate(pendingDate);
    setSelectedLocation(pendingLocation);
    setPage(1);
  };

  // When user clears a filter, clear both pending and applied
  const clearDate = () => {
    setPendingDate(null);
    setSelectedDate(null);
  };
  const clearLocation = () => {
    setPendingLocation(null);
    setSelectedLocation(null);
  };

  // Filtering logic uses only applied states - for all events (used in location/date filters)
  const filteredEventsByDate = sortedEvents.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase());
    const matchesDate = selectedDate ? event.date === selectedDate : true;
    const matchesLocation = selectedLocation ? event.location === selectedLocation : true;
    return matchesSearch && matchesDate && matchesLocation;
  });
  
  // Get all filtered events grouped by category (excluding "Yeni Tədbir")
  const filteredCategories = eventsByCategory
    .filter(category => category.name !== "Yeni Tədbir")
    .map(category => ({
      ...category,
      events: category.events.filter((event) => {
        const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase());
        const matchesDate = selectedDate ? event.date === selectedDate : true;
        const matchesLocation = selectedLocation ? event.location === selectedLocation : true;
        return matchesSearch && matchesDate && matchesLocation;
      })
    }))
    .filter(category => category.events.length > 0);
  
  // Flatten all filtered events for pagination
  const allFilteredEvents = filteredCategories.flatMap(category => category.events);
  
  // Calculate pagination for all events
  const totalPages = Math.ceil(allFilteredEvents.length / pageSize);
  const paginatedEvents = allFilteredEvents.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  
  // Group paginated events back by category
  const paginatedEventsByCategory = filteredCategories.map(category => ({
    ...category,
    events: category.events.filter(event => 
      paginatedEvents.some(pe => pe.id === event.id)
    )
  })).filter(category => category.events.length > 0);

  // Filtered locations for dropdown (only those with events for pending date)
  const filteredLocations = Array.from(
    new Set(
      sortedEvents
        .filter(event => !pendingDate || event.date === pendingDate)
        .map(event => event.location)
    )
  );

  // Filtered dates for date picker (only those with events for pending location)
  const filteredDates = Array.from(
    new Set(
      sortedEvents
        .filter(event => !pendingLocation || event.location === pendingLocation)
        .map(event => event.date)
    )
  );

  useEffect(() => {
    function handleResize() {
      setPageSize(window.innerWidth < 1024 ? 5 : 12);
      setPage(1); // Reset to first page on resize
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [allFilteredEvents, page, totalPages]);

  // Close datepicker on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dateIconRef.current &&
        !dateIconRef.current.contains(e.target) &&
        !document.querySelector(".react-datepicker")?.contains(e.target)
      ) {
        setShowDatePicker(false);
      }
    }
    if (showDatePicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDatePicker]);

  // Close mobile location dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        locationDropdownRefMobile.current &&
        !locationDropdownRefMobile.current.contains(e.target)
      ) {
        setShowLocationDropdownMobile(false);
      }
    }
    if (showLocationDropdownMobile) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLocationDropdownMobile]);

  // Close desktop location dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        locationDropdownRefDesktop.current &&
        !locationDropdownRefDesktop.current.contains(e.target)
      ) {
        setShowLocationDropdownDesktop(false);
      }
    }
    if (showLocationDropdownDesktop) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLocationDropdownDesktop]);

  return (
    <motion.div
      className="h-fit"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="hero h-[620px] px-[16px] md:px-[32px] xl:px-[108px] py-[30px] relative bg-cover bg-center"
        style={{
          backgroundImage: `url(${settings.cover_image})`,
        }}
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div className="header flex justify-between h-[41px]">
          <img
            src={settings.icon}
            alt="logo"
            className="w-[64px] md:w-[100px] h-[64px] md:h-[100px]"
          />
          {buttonEvent && (
            <a
              href={buttonEvent.link}
              target="_blank"
              className="text-[#FFFFFF] w-[189px] md:w-[189px] h-[38px] md:h-[41px] font-medium bg-[#42AB5D] border border-[#42AB5D] rounded-[100px] px-[15px] py-[10px] flex justify-center items-center hover:bg-white hover:text-[#42AB5D] transition-all duration-300"
            >
              {settings.button_text}
            </a>
          )}
        </div>
        {/* <p className="text-[#FFFFFF] md:w-[466px] lg:w-[700px] text-3xl md:text-[64px] font-bold absolute left-4 md:left-[108px] bottom-20 md:bottom-[100px] max-w-[700px] drop-shadow-lg">
          {latestEvent.title}
        </p> */}
        <div className="mobile-btn w-[90%] pl-[16px] h-[56px] bg-white text-[14px] md:hidden text-white rounded-full shadow-lg flex items-center justify-between absolute left-1/2 -translate-x-1/2 bottom-[-90px] z-20">
        <div
              className="hidden md:flex items-center min-w-[110px] justify-center relative"
              ref={dateIconRef}
            >
              <button
                type="button"
                onClick={() => setShowDatePicker((v) => !v)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <TbCalendarFilled className="w-[24px] h-[24px] text-black" />
                <span className="text-[#252525] text-lg font-medium whitespace-nowrap">
                  {pendingDate ? pendingDate : "Tarix"}
                </span>
              </button>
              {pendingDate && (
                <button
                  onClick={clearDate}
                  className="ml-2 text-xs text-red-500 hover:underline"
                >
                  <IoIosClose className="w-[24px] h-[24px] text-red-500" />
                </button>
              )}
              {showDatePicker && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-12 right-0 md:left-0 md:right-auto z-50"
                  >
                    <DatePicker
                      inline
                      selected={pendingDate ? new Date(pendingDate) : null}
                      onChange={(date) => {
                        setPendingDate(formatDateToYMDLocal(date));
                        setShowDatePicker(false);
                      }}
                      includeDates={filteredDates.map(d => new Date(d))}
                      dayClassName={date => {
                        // Only show days in the current month
                        const displayedMonth = (pendingDate ? new Date(pendingDate) : date).getMonth();
                        return date.getMonth() === displayedMonth ? "" : "hidden";
                      }}
                      calendarClassName="!border !rounded-xl !shadow-lg"
                      locale="az"
                    />
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
            {/* Divider */}
            <div className="hidden md:block h-10 w-px bg-[#E0E0E0] mx-4" />
            {/* Location */}
            <div className="flex md:hidden items-center min-w-[110px] justify-center relative" ref={locationDropdownRefMobile}>
              <button
                type="button"
                onClick={() => setShowLocationDropdownMobile(v => !v)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <IoLocationOutline className="text-2xl text-[#252525]" />
                <span className="text-[#252525] text-lg font-medium">
                  {pendingLocation || "Məkan"}
                </span>
              </button>
              {pendingLocation && (
                <button
                  onClick={clearLocation}
                  className="ml-2 text-xs text-red-500 hover:underline"
                >
                  <IoIosClose className="w-[24px] h-[24px] text-red-500" />
                </button>
              )}
              {showLocationDropdownMobile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-12 left-0 z-50 bg-white border rounded-xl shadow-lg min-w-[150px] max-h-[200px] overflow-y-auto"
                >
                  {filteredLocations.map(loc => (
                    <div
                      key={loc}
                      onClick={() => {
                        setPendingLocation(loc);
                        setShowLocationDropdownMobile(false);
                      }}
                      className={`px-4 py-2 cursor-pointer text-black hover:bg-[#42AB5D] hover:text-white ${pendingLocation === loc ? 'bg-[#42AB5D] text-white' : ''}`}
                    >
                      {loc}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
            <button
              className="w-[50%] h-[56px] text-[14px] bg-[#42AB5D] md:hidden text-white rounded-full shadow-lg flex items-center justify-center px-4 md:px-8"
              onClick={applyFilters}
            >
              Axtar
            </button>
        </div>
        
        <div className="searchbar w-[90%] md:w-[80%] max-w-[1548px]   h-[56px] md:h-[76px] bg-white rounded-full shadow-lg flex items-center justify-between px-4 md:px-8 absolute left-1/2 -translate-x-1/2 bottom-[-28px] md:bottom-[-38px] z-20">
          {/* Search input */}
          <input
            type="text"
            placeholder="Axtarış"
            value={pendingSearch}
            onChange={(e) => setPendingSearch(e.target.value)}
            className="w-2/4 md:w-1/2 bg-transparent outline-none text-[#252525] text-lg placeholder:text-[#252525] font-medium px-2 md:px-4"
          />
          {/* Divider */}
          <div className="flex items-center">
            <div className="hidden md:block h-10 w-px bg-[#E0E0E0] mx-4" />
            {/* Date */}
            <div
              className="flex items-center min-w-[110px] justify-center relative "
              ref={dateIconRef}
            >
              <button
                type="button"
                onClick={() => setShowDatePicker((v) => !v)}
                className="flex items-center gap-2 focus:outline-none hover:cursor-pointer"
              >
                <TbCalendarFilled className="w-[24px] h-[24px] text-black" />
                <span className="text-[#252525] text-lg font-medium whitespace-nowrap">
                  {pendingDate ? pendingDate : "Tarix"}
                </span>
              </button>
              {pendingDate && (
                <button
                  onClick={clearDate}
                  className="ml-2 text-xs text-red-500 "
                >
                  <IoIosClose className="w-[24px] h-[24px] text-red-500" />
                </button>
              )}
              <AnimatePresence>
              {showDatePicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-12 right-0 md:left-0 md:right-auto z-50"
                  >
                    <DatePicker
                      inline
                      selected={pendingDate ? new Date(pendingDate) : null}
                      onChange={(date) => {
                        setPendingDate(formatDateToYMDLocal(date));
                        setShowDatePicker(false);
                      }}
                      includeDates={filteredDates.map(d => new Date(d))}
                      dayClassName={date => {
                        const displayedMonth = (pendingDate ? new Date(pendingDate) : date).getMonth();
                        return date.getMonth() === displayedMonth ? "" : "hidden";
                      }}
                      calendarClassName="!border !rounded-xl !shadow-lg"
                      locale="az"
                    />
                  </motion.div>
              )}
              </AnimatePresence>
            </div>
            {/* Divider */}
            <div className="hidden md:block h-10 w-px bg-[#E0E0E0] mx-4" />
            {/* Location */}
            <div className="hidden md:flex items-center min-w-[110px] justify-center relative" ref={locationDropdownRefDesktop}>
              <button
                type="button"
                onClick={() => setShowLocationDropdownDesktop(v => !v)}
                className="flex items-center gap-2 focus:outline-none hover:cursor-pointer"
              >
                <IoLocationOutline className="text-2xl text-[#252525]" />
                <span className="text-[#252525] text-lg font-medium whitespace-nowrap">
                  {pendingLocation || "Məkan"}
                </span>
              </button>
              {pendingLocation && (
                <button
                  onClick={clearLocation}
                  className="ml-2 text-xs text-red-500 hover:underline"
                >
                  <IoIosClose className="w-[24px] h-[24px] text-red-500" />
                </button>
              )}
              <AnimatePresence>
              {showLocationDropdownDesktop && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-14 left-0 z-50 bg-white  rounded-xl shadow-lg min-w-[150px] max-h-[200px] overflow-y-auto"
                >
                  {filteredLocations.map(loc => (
                    <div
                      key={loc}
                      onClick={() => {
                        setPendingLocation(loc);
                        setShowLocationDropdownDesktop(false);
                      }}
                      className={`px-4 py-2 cursor-pointer text-black hover:bg-[#42AB5D] hover:text-white ${pendingLocation === loc ? 'bg-[#42AB5D] text-white' : ''}`}
                    >
                      {loc}
                    </div>
                  ))}
                </motion.div>
              )}
              </AnimatePresence>
            </div>
            {/* Search button */}
            <button
              className="ml-2 bg-[#42AB5D] text-white font-semibold rounded-full px-8 py-3 text-lg transition-all hidden md:flex hover:cursor-pointer border border-[#42AB5D] hover:bg-white hover:text-[#42AB5D]"
              onClick={applyFilters}
            >
              Axtar
            </button>
          </div>
        </div>
      </motion.div>
      <div className="px-[16px] md:px-[32px] xl:px-[108px] pt-[102px] bg-[url('../public/bg-image.svg')] bg-cover bg-center flex flex-col 2xl:items-center">
        <div className="flex flex-col justify-between h-[calc(100vh-795px)] min-h-fit">
          <div>
            {loading ? (
              <div className="text-center text-gray-500 font-semibold py-12">
                Yüklənir...
              </div>
            ) : error ? (
              <div className="text-center text-red-500 font-semibold py-12">
                Xəta: {error}
              </div>
            ) : (
              <>
                {rightNowEvents && rightNowEvents.length > 0 && (
                  <>
                    <p className="text-[#252525] text-[16px] md:text-[32px] font-medium mt-[16px] md:mt-[0px] md:mb-[32px] mb-[16px] max-w-[1648px] 2xl:min-w-[1361px]">
                      Növbəti Tədbir
                    </p>
                    <motion.div
                      className="event-container flex max-w-[1648px] mb-[32px]"
                      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                      initial="hidden"
                      animate="visible"
                    >
                      <AnimatePresence>
                        <motion.div
                          className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-[16px] gap-y-[16px] md:gap-x-[24px] md:gap-y-[24px]"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -30 }}
                          transition={{ duration: 0.4 }}
                        >
                          {rightNowEvents.map((event) => (
                            <Card key={event.id} event={event} />
                          ))}
                        </motion.div>
                      </AnimatePresence>
                    </motion.div>
                  </>
                )}
                {paginatedEventsByCategory.length > 0 ? (
                  paginatedEventsByCategory.map((category) => (
                    <div key={category.name} className="mb-[48px]">
                      <p className="text-[#252525] text-[16px] md:text-[32px] font-medium mt-[16px] md:mt-[0px] md:mb-[32px] mb-[16px] max-w-[1648px] 2xl:min-w-[1361px]">
                        {category.name}
                      </p>
                      <motion.div
                        className="event-container flex max-w-[1648px]"
                        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                        initial="hidden"
                        animate="visible"
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={page}
                            className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-[16px] gap-y-[16px] md:gap-x-[24px] md:gap-y-[24px]"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.4 }}
                          >
                            {category.events.map((event) => (
                              <Card key={event.id} event={event} />
                            ))}
                          </motion.div>
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  ))
                ) : (
                  !loading && !error && (
                    <motion.div className="col-span-full text-center text-gray-400 font-semibold py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      Belə tədbir baş verməmişdir
                    </motion.div>
                  )
                )}
              </>
            )}
            {/* Pagination controls - shared across all categories */}
            {!loading && !error && totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded bg-[#EFEAFE] text-[#252525] font-semibold disabled:opacity-50 hover:cursor-pointer"
                >
                  <IoIosArrowBack className="w-[24px] h-[24px]" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-1 rounded font-semibold hover:cursor-pointer ${
                      page === i + 1
                        ? "bg-[#42AB5D] text-white"
                        : "bg-[#EFEAFE] text-[#252525]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded bg-[#EFEAFE] text-[#252525] font-semibold disabled:opacity-50 hover:cursor-pointer"
                >
                  <IoIosArrowForward className="w-[24px] h-[24px]" />
                </button>
              </div>
            )}
          </div>
          <motion.div
            className="footer w-full  mt-[102px] flex flex-col md:flex-row gap-x-[113px] gap-y-[16px] md:gap-y-[0px]  justify-center pb-[48px]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex flex-col gap-y-[48px]">
              <div className="flex justify-center md:justify-start">
                <img src={logo2} className="w-[138px] h-[138px]" alt="" />
              </div>
              <div className="flex gap-x-[13px] items-center">
                <IoIosPhonePortrait className="text-[#42AB5D] text-[24px]" />
                <div>
                  <p className="text-[#42AB5D] text-[14px] font-medium">
                    Əlaqə Saxlayın
                  </p>
                  <p className="text-[#252525] text-[20px] font-bold">
                    {settings.phone}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-row md:flex-col  gap-y-[24px]  justify-between md:justify-start">
              <div>
                <p className="text-[#252525] text-[16px] font-bold mb-[24px]">
                  Əlaqə Saxlayın
                </p>
                <p className="text-[#42AB5D] text-[16px] font-bold mb-[8px]">
                  Tədbirin ünvanı:
                </p>
                <p className="text-[#72678F] text-[16px] font-bold w-[174px] md:w-[250px]">
                  {settings.location}
                </p>
              </div>
              <div className="flex gap-x-[6px] flex-row items-end">
                <a
                  href={settings.fb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-x-[13px] items-center justify-center w-[34px] h-[34px] md:w-[42px] md:h-[42px] bg-[#EFEAFE] rounded-full group hover:bg-[#42AB5D] transition-all duration-300"
                >
                  <FaFacebookF className="text-[#72678F] text-[16px] md:text-[22px] group-hover:text-white transition-all duration-300" />
                </a>
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-x-[13px] items-center justify-center w-[34px] h-[34px] md:w-[42px] md:h-[42px] bg-[#EFEAFE] rounded-full group hover:bg-[#42AB5D] transition-all duration-300"
                >
                  <FaInstagram className="text-[#72678F] text-[16px] md:text-[22px] group-hover:text-white transition-all duration-300" />
                </a>
                <a
                  href={settings.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-x-[13px] items-center justify-center w-[34px] h-[34px] md:w-[42px] md:h-[42px] bg-[#EFEAFE] rounded-full group hover:bg-[#42AB5D] transition-all duration-300"
                >
                  <FaYoutube className="text-[#72678F] text-[16px] md:text-[22px] group-hover:text-white transition-all duration-300" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <motion.div
        className="copy text-[#252525] text-[16px] font-medium py-[24px] border-t border-[#EFEAFE] flex flex-col md:flex-row items-center md:items-start justify-center md:justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <p className="text-center">
          Copyright © 2025 Bütün Hüquqlar Qorunur! &nbsp;
        </p>
        <a href="https://utdevelopment.az/" className="">
          Developed by <span className="text-[#1E83FF]">UTD</span>
        </a>
      </motion.div>
    </motion.div>
  );
}

export default App;
