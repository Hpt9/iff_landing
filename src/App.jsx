import "./App.css";
import logo from "../public/logo1.svg";
import logo2 from "../public/logo2.svg";
import { eventData } from "./components/data";
import { Card } from "./components/card";
import { IoIosPhonePortrait } from "react-icons/io";

import { FaInstagram } from "react-icons/fa";
import { FaFacebookF } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { FaRegCalendarAlt } from "react-icons/fa";
import { GoLocation } from "react-icons/go";
import { TbCalendarFilled } from "react-icons/tb";
import { IoLocationOutline } from "react-icons/io5";
import { useState, useEffect } from "react";

function App() {
  // Sort events by date descending and get the latest event
  const sortedEvents = [...eventData].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  const latestEvent = sortedEvents[0];
  console.log(latestEvent);
  const otherEvents = sortedEvents.slice(1);

  // Search state
  const [search, setSearch] = useState("");
  const filteredEvents = otherEvents.filter((event) =>
    event.title.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(window.innerWidth < 1024 ? 5 : 12);

  useEffect(() => {
    function handleResize() {
      setPageSize(window.innerWidth < 1024 ? 5 : 12);
      setPage(1); // Reset to first page on resize
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate paginated events
  const totalPages = Math.ceil(filteredEvents.length / pageSize);
  const paginatedEvents = filteredEvents.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // If page is out of range (e.g. after filtering), reset to 1
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [filteredEvents, page, totalPages]);

  return (
    <div className="h-fit">
      <div
        className="hero h-[620px] px-[16px] md:px-[32px] xl:px-[108px] py-[30px] relative bg-cover bg-center"
        style={{
          backgroundImage: `url(${latestEvent.imagePath
            .replace("../public/", "/")
            .replace("./public/", "/")})`,
        }}
      >
        <div className="header flex justify-between h-[41px]">
          <img
            src={logo}
            alt="logo"
            className="w-[64px] md:w-[100px] h-[64px] md:h-[100px]"
          />
          <a
            href={latestEvent.link}
            target="_blank"
            className="text-[#FFFFFF] w-[156px md:w-[171px] h-[38px] md:h-[41px] font-medium bg-[#42AB5D] border border-[#42AB5D] rounded-[100px] px-[15px] py-[10px] flex justify-center items-center hover:bg-white hover:text-[#42AB5D] transition-all duration-300"
          >
            Tədbir haqqında
          </a>
        </div>
        <p className="text-[#FFFFFF] w-[70%] md:w-[466px] text-3xl md:text-[64px] font-bold absolute left-4 md:left-[108px] bottom-20 md:bottom-[100px] max-w-[700px] drop-shadow-lg">
          {latestEvent.title}
        </p>
        <button className="mobile-btn w-full h-[38px] bg-[#42AB5D] text-[14px] md:hidden text-white rounded-full shadow-lg flex items-center justify-center px-4 md:px-8 absolute left-1/2 -translate-x-1/2 bottom-[-74px] z-20">
          Axtar
        </button>
        <div className="searchbar w-full md:w-[755px]  max-w-[1200px] h-[56px] md:h-[76px] bg-white rounded-full shadow-lg flex items-center justify-between px-4 md:px-8 absolute left-1/2 -translate-x-1/2 bottom-[-28px] md:bottom-[-38px] z-20">
          {/* Search input */}
          <input
            type="text"
            placeholder="Axtarış"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-2/4 md:w-1/2 bg-transparent outline-none text-[#252525] text-lg placeholder:text-[#252525] font-medium px-2 md:px-4"
          />
          {/* Divider */}
          <div className="hidden md:block h-10 w-px bg-[#E0E0E0] mx-4" />
          {/* Date */}
          <div className="flex items-center gap-2 min-w-[110px] justify-center">
            <TbCalendarFilled className="w-[24px] h-[24px] text-black" />
            <span className="text-[#252525] text-lg font-medium">Tarix</span>
          </div>
          {/* Divider */}
          <div className="hidden md:block h-10 w-px bg-[#E0E0E0] mx-4" />
          {/* Location */}
          {/* <div className="flex items-center gap-2 min-w-[110px] justify-center">
            <IoLocationOutline className="text-2xl text-[#252525]" />
            <span className="text-[#252525] text-lg font-medium">Məkan</span>
          </div> */}
          {/* Search button */}
          <button className="ml-2 bg-[#42AB5D] hover:bg-[#36924a] text-white font-semibold rounded-full px-8 py-3 text-lg transition-all hidden md:flex">
            Axtar
          </button>
        </div>
      </div>
      <div className="px-[16px] md:px-[32px] xl:px-[108px] pt-[102px] bg-[url('../public/bg-image.svg')] bg-cover bg-center flex flex-col 2xl:items-center">
        <div className="flex flex-col justify-between h-[calc(100vh-795px)] min-h-fit">
          <div>
            <p className="text-[#252525] text-[16px] md:text-[32px] font-medium mt-[16px] md:mt-[0px] md:mb-[32px] mb-[16px] max-w-[1648px] 2xl:min-w-[1361px]">
              Sonuncu Tədbirlər
            </p>
            <div className="event-container flex  max-w-[1648px]">
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-[16px] gap-y-[16px] md:gap-x-[24px] md:gap-y-[24px]">
                {paginatedEvents.length === 0 ? (
                  <div className="col-span-full text-center text-gray-400 font-semibold py-12">
                    Belə tədbir baş verməmişdir
                  </div>
                ) : (
                  paginatedEvents.map((event) => (
                    <Card key={event.id} event={event} />
                  ))
                )}
              </div>
            </div>
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded bg-[#EFEAFE] text-[#252525] font-semibold disabled:opacity-50"
                >
                  Əvvəlki
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-1 rounded font-semibold ${
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
                  className="px-3 py-1 rounded bg-[#EFEAFE] text-[#252525] font-semibold disabled:opacity-50"
                >
                  Sonrakı
                </button>
              </div>
            )}
          </div>
          <div className="footer w-full  mt-[102px] flex flex-col md:flex-row gap-x-[113px] gap-y-[16px] md:gap-y-[0px]  justify-center pb-[48px]">
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
                    +994 51 634 85 96
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
                  Azərbaycan, Bakı şəhəri, Xocalı prospekti, İbis Hotel
                </p>
              </div>
              <div className="flex gap-x-[6px] flex-row items-end">
                <a
                  href="https://www.facebook.com/iif.birgekod.az"
                  target="_blank"
                  className="flex gap-x-[13px] items-center justify-center w-[34px] h-[34px] md:w-[42px] md:h-[42px] bg-[#EFEAFE] rounded-full group hover:bg-[#42AB5D] transition-all duration-300"
                >
                  <FaFacebookF className="text-[#72678F] text-[16px] md:text-[22px] group-hover:text-white transition-all duration-300" />
                </a>
                <a
                  href="https://www.instagram.com/iif.birgekod.az"
                  target="_blank"
                  className="flex gap-x-[13px] items-center justify-center w-[34px] h-[34px] md:w-[42px] md:h-[42px] bg-[#EFEAFE] rounded-full group hover:bg-[#42AB5D] transition-all duration-300"
                >
                  <FaInstagram className="text-[#72678F] text-[16px] md:text-[22px] group-hover:text-white transition-all duration-300" />
                </a>
                <a
                  href="https://www.youtube.com/@iif.birgekod"
                  target="_blank"
                  className="flex gap-x-[13px] items-center justify-center w-[34px] h-[34px] md:w-[42px] md:h-[42px] bg-[#EFEAFE] rounded-full group hover:bg-[#42AB5D] transition-all duration-300"
                >
                  <FaYoutube className="text-[#72678F] text-[16px] md:text-[22px] group-hover:text-white transition-all duration-300" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="copy text-[#252525] text-[16px] font-medium py-[24px] border-t border-[#EFEAFE] flex flex-col md:flex-row items-center md:items-start justify-center md:justify-center">
        <p className="text-center">Copyright © 2025 Bütün Hüquqlar Qorunur! &nbsp;</p>
        <a href="https://utdevelopment.az/" className="">
          Developed by <span className="text-[#1E83FF]">UTD</span>
        </a>
      </div>
    </div>
  );
}

export default App;
