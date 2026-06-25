--
-- PostgreSQL database cluster dump
--

\restrict JYWaLliLkJmTags2sPXEWPBJzLKcOSzbfLvAIk1yBobZZX6P9ZDjeGAxRGdulvl

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE plcuser;
ALTER ROLE plcuser WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:wxtzLLjJTAMTj/nwSegb8Q==$MTtw8MyCHx8ej+guDQ50PKgnMYyB9SjIHUuCVNs23TI=:3Qj16rPed1feg6rM2laJY3H9mxUyZUMfQRerDTP+SJY=';

--
-- User Configurations
--








\unrestrict JYWaLliLkJmTags2sPXEWPBJzLKcOSzbfLvAIk1yBobZZX6P9ZDjeGAxRGdulvl

--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

\restrict slIYvMHT09619143KgzDOLm2Yj5O6N35S83kwFpONjev1c6ivTpUpuFO9DjEDJM

-- Dumped from database version 15.18
-- Dumped by pg_dump version 15.18

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\unrestrict slIYvMHT09619143KgzDOLm2Yj5O6N35S83kwFpONjev1c6ivTpUpuFO9DjEDJM

--
-- Database "plc_readings" dump
--

--
-- PostgreSQL database dump
--

\restrict 6MaZ67Qsv2FBZe821wb4T5B5GMAnm189uNOaIYM7y7rFAfuQLq2GN0lOkTPCGGr

-- Dumped from database version 15.18
-- Dumped by pg_dump version 15.18

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plc_readings; Type: DATABASE; Schema: -; Owner: plcuser
--

CREATE DATABASE plc_readings WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE plc_readings OWNER TO plcuser;

\unrestrict 6MaZ67Qsv2FBZe821wb4T5B5GMAnm189uNOaIYM7y7rFAfuQLq2GN0lOkTPCGGr
\connect plc_readings
\restrict 6MaZ67Qsv2FBZe821wb4T5B5GMAnm189uNOaIYM7y7rFAfuQLq2GN0lOkTPCGGr

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: production_cycles; Type: TABLE; Schema: public; Owner: plcuser
--

CREATE TABLE public.production_cycles (
    id integer NOT NULL,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone,
    status character varying(50) DEFAULT 'Aktif'::character varying
);


ALTER TABLE public.production_cycles OWNER TO plcuser;

--
-- Name: production_cycles_id_seq; Type: SEQUENCE; Schema: public; Owner: plcuser
--

CREATE SEQUENCE public.production_cycles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.production_cycles_id_seq OWNER TO plcuser;

--
-- Name: production_cycles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: plcuser
--

ALTER SEQUENCE public.production_cycles_id_seq OWNED BY public.production_cycles.id;


--
-- Name: system_logs; Type: TABLE; Schema: public; Owner: plcuser
--

CREATE TABLE public.system_logs (
    id integer NOT NULL,
    level character varying(10) NOT NULL,
    message text NOT NULL,
    details jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.system_logs OWNER TO plcuser;

--
-- Name: system_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: plcuser
--

CREATE SEQUENCE public.system_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.system_logs_id_seq OWNER TO plcuser;

--
-- Name: system_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: plcuser
--

ALTER SEQUENCE public.system_logs_id_seq OWNED BY public.system_logs.id;


--
-- Name: tag_readings; Type: TABLE; Schema: public; Owner: plcuser
--

CREATE TABLE public.tag_readings (
    id integer NOT NULL,
    tag_id character varying(50) NOT NULL,
    tag_name character varying(100) NOT NULL,
    tag_type character varying(10) NOT NULL,
    tag_unit character varying(20) NOT NULL,
    value double precision NOT NULL,
    success boolean DEFAULT true,
    error_message text,
    reading_timestamp timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tag_readings OWNER TO plcuser;

--
-- Name: tag_readings_daily; Type: TABLE; Schema: public; Owner: plcuser
--

CREATE TABLE public.tag_readings_daily (
    id integer NOT NULL,
    tag_id character varying(50) NOT NULL,
    reading_date date NOT NULL,
    min_value double precision,
    max_value double precision,
    avg_value double precision,
    count_readings integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tag_readings_daily OWNER TO plcuser;

--
-- Name: tag_readings_daily_id_seq; Type: SEQUENCE; Schema: public; Owner: plcuser
--

CREATE SEQUENCE public.tag_readings_daily_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tag_readings_daily_id_seq OWNER TO plcuser;

--
-- Name: tag_readings_daily_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: plcuser
--

ALTER SEQUENCE public.tag_readings_daily_id_seq OWNED BY public.tag_readings_daily.id;


--
-- Name: tag_readings_id_seq; Type: SEQUENCE; Schema: public; Owner: plcuser
--

CREATE SEQUENCE public.tag_readings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tag_readings_id_seq OWNER TO plcuser;

--
-- Name: tag_readings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: plcuser
--

ALTER SEQUENCE public.tag_readings_id_seq OWNED BY public.tag_readings.id;


--
-- Name: production_cycles id; Type: DEFAULT; Schema: public; Owner: plcuser
--

ALTER TABLE ONLY public.production_cycles ALTER COLUMN id SET DEFAULT nextval('public.production_cycles_id_seq'::regclass);


--
-- Name: system_logs id; Type: DEFAULT; Schema: public; Owner: plcuser
--

ALTER TABLE ONLY public.system_logs ALTER COLUMN id SET DEFAULT nextval('public.system_logs_id_seq'::regclass);


--
-- Name: tag_readings id; Type: DEFAULT; Schema: public; Owner: plcuser
--

ALTER TABLE ONLY public.tag_readings ALTER COLUMN id SET DEFAULT nextval('public.tag_readings_id_seq'::regclass);


--
-- Name: tag_readings_daily id; Type: DEFAULT; Schema: public; Owner: plcuser
--

ALTER TABLE ONLY public.tag_readings_daily ALTER COLUMN id SET DEFAULT nextval('public.tag_readings_daily_id_seq'::regclass);


--
-- Data for Name: production_cycles; Type: TABLE DATA; Schema: public; Owner: plcuser
--

COPY public.production_cycles (id, start_time, end_time, status) FROM stdin;
1	2026-06-25 01:04:14.739	2026-06-25 01:05:34.778	Tamamlandı
2	2026-06-25 01:11:04.677	2026-06-25 01:15:44.773	Tamamlandı
3	2026-06-25 23:12:27.131	2026-06-25 23:14:47.182	Tamamlandı
4	2026-06-25 23:22:46.297	2026-06-25 23:36:46.576	Tamamlandı
6	2026-06-26 00:34:05.721	2026-06-26 00:37:05.763	Tamamlandı
7	2026-06-26 00:46:01.473	2026-06-26 00:47:01.492	Tamamlandı
5	2026-06-26 00:25:05.339	\N	Tamamlandı
8	2026-06-26 00:58:19.424	2026-06-26 00:58:39.425	Tamamlandı
\.


--
-- Data for Name: system_logs; Type: TABLE DATA; Schema: public; Owner: plcuser
--

COPY public.system_logs (id, level, message, details, created_at) FROM stdin;
1	INFO	System started	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-23 22:41:36.817142
2	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-23 23:12:24.907586
3	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-23 23:13:47.03227
4	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-23 23:14:08.274582
5	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-23 23:14:31.195389
6	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-23 23:30:31.204837
7	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-23 23:34:47.171293
8	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-23 23:39:44.471526
9	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-23 23:42:43.348089
10	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-23 23:43:47.079293
11	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-23 23:45:50.119475
12	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-23 23:47:20.213216
13	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-23 23:48:08.806435
14	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-23 23:48:28.654526
15	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-23 23:51:06.168615
16	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-23 23:52:03.537495
17	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-23 23:52:47.235238
18	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-23 23:54:08.805836
19	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-23 23:56:47.478289
20	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-23 23:57:57.527426
21	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-23 23:59:57.466671
22	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-24 00:00:35.510734
23	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-24 00:00:46.854288
24	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-24 00:01:10.450032
25	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-24 00:01:30.800309
26	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-24 00:01:46.215445
27	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-24 00:02:30.60838
28	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-24 00:02:44.184114
29	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-24 00:02:54.120644
30	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-24 00:03:08.880326
31	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-24 00:03:28.516698
32	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-24 00:04:37.776814
33	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-24 00:04:54.428716
34	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-24 00:06:14.133398
35	INFO	System started - REAL PLC	{"host": "192.168.0.1", "rack": 0, "slot": 1}	2026-06-24 00:08:33.072834
\.


--
-- Data for Name: tag_readings; Type: TABLE DATA; Schema: public; Owner: plcuser
--

COPY public.tag_readings (id, tag_id, tag_name, tag_type, tag_unit, value, success, error_message, reading_timestamp, created_at) FROM stdin;
1	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	25.85	t	\N	2026-06-24 23:08:25.967	2026-06-24 20:08:25.966155
2	TANK_BASINCI	Tank Basıncı	unknown	bar	0.69	t	\N	2026-06-24 23:08:25.978	2026-06-24 20:08:25.966155
3	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	1000	t	\N	2026-06-24 23:08:25.979	2026-06-24 20:08:25.966155
4	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	58.15	t	\N	2026-06-24 23:08:25.981	2026-06-24 20:08:25.966155
5	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	1457	t	\N	2026-06-24 23:08:25.982	2026-06-24 20:08:25.966155
6	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	25.85	t	\N	2026-06-24 23:09:25.953	2026-06-24 20:09:25.95174
7	TANK_BASINCI	Tank Basıncı	unknown	bar	0.69	t	\N	2026-06-24 23:09:25.955	2026-06-24 20:09:25.95174
8	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	1000	t	\N	2026-06-24 23:09:25.955	2026-06-24 20:09:25.95174
9	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	58.15	t	\N	2026-06-24 23:09:25.956	2026-06-24 20:09:25.95174
10	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	1457	t	\N	2026-06-24 23:09:25.957	2026-06-24 20:09:25.95174
11	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	25.85	t	\N	2026-06-24 23:10:25.953	2026-06-24 20:10:25.952606
12	TANK_BASINCI	Tank Basıncı	unknown	bar	0.69	t	\N	2026-06-24 23:10:25.955	2026-06-24 20:10:25.952606
13	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	1000	t	\N	2026-06-24 23:10:25.955	2026-06-24 20:10:25.952606
14	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	58.15	t	\N	2026-06-24 23:10:25.956	2026-06-24 20:10:25.952606
15	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	1457	t	\N	2026-06-24 23:10:25.956	2026-06-24 20:10:25.952606
16	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	25.85	t	\N	2026-06-24 23:11:25.96	2026-06-24 20:11:25.959521
17	TANK_BASINCI	Tank Basıncı	unknown	bar	0.69	t	\N	2026-06-24 23:11:25.961	2026-06-24 20:11:25.959521
18	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	1000	t	\N	2026-06-24 23:11:25.962	2026-06-24 20:11:25.959521
19	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	58.15	t	\N	2026-06-24 23:11:25.963	2026-06-24 20:11:25.959521
20	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	1457	t	\N	2026-06-24 23:11:25.964	2026-06-24 20:11:25.959521
21	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	25.85	t	\N	2026-06-24 23:12:25.973	2026-06-24 20:12:25.973138
22	TANK_BASINCI	Tank Basıncı	unknown	bar	0.69	t	\N	2026-06-24 23:12:25.976	2026-06-24 20:12:25.973138
23	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	1000	t	\N	2026-06-24 23:12:25.977	2026-06-24 20:12:25.973138
24	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	58.15	t	\N	2026-06-24 23:12:25.978	2026-06-24 20:12:25.973138
25	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	1457	t	\N	2026-06-24 23:12:25.979	2026-06-24 20:12:25.973138
26	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	25.85	t	\N	2026-06-24 23:13:25.984	2026-06-24 20:13:25.982993
27	TANK_BASINCI	Tank Basıncı	unknown	bar	0.69	t	\N	2026-06-24 23:13:25.986	2026-06-24 20:13:25.982993
28	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	1000	t	\N	2026-06-24 23:13:25.987	2026-06-24 20:13:25.982993
29	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	58.15	t	\N	2026-06-24 23:13:25.988	2026-06-24 20:13:25.982993
30	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	1457	t	\N	2026-06-24 23:13:25.989	2026-06-24 20:13:25.982993
31	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	25.85	t	\N	2026-06-24 23:14:25.992	2026-06-24 20:14:25.99126
32	TANK_BASINCI	Tank Basıncı	unknown	bar	0.69	t	\N	2026-06-24 23:14:25.995	2026-06-24 20:14:25.99126
33	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	1000	t	\N	2026-06-24 23:14:25.996	2026-06-24 20:14:25.99126
34	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	58.15	t	\N	2026-06-24 23:14:25.997	2026-06-24 20:14:25.99126
35	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	1457	t	\N	2026-06-24 23:14:25.998	2026-06-24 20:14:25.99126
36	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	25.85	t	\N	2026-06-24 23:15:26.008	2026-06-24 20:15:26.007922
37	TANK_BASINCI	Tank Basıncı	unknown	bar	0.69	t	\N	2026-06-24 23:15:26.011	2026-06-24 20:15:26.007922
38	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	1000	t	\N	2026-06-24 23:15:26.012	2026-06-24 20:15:26.007922
39	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	58.15	t	\N	2026-06-24 23:15:26.013	2026-06-24 20:15:26.007922
40	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	1457	t	\N	2026-06-24 23:15:26.014	2026-06-24 20:15:26.007922
41	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	25.85	t	\N	2026-06-24 23:16:26.005	2026-06-24 20:16:26.004349
42	TANK_BASINCI	Tank Basıncı	unknown	bar	0.69	t	\N	2026-06-24 23:16:26.006	2026-06-24 20:16:26.004349
43	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	1000	t	\N	2026-06-24 23:16:26.007	2026-06-24 20:16:26.004349
44	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	58.15	t	\N	2026-06-24 23:16:26.007	2026-06-24 20:16:26.004349
45	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	1457	t	\N	2026-06-24 23:16:26.008	2026-06-24 20:16:26.004349
46	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	25.85	t	\N	2026-06-24 23:17:26.069	2026-06-24 20:17:26.068572
47	TANK_BASINCI	Tank Basıncı	unknown	bar	0.69	t	\N	2026-06-24 23:17:26.07	2026-06-24 20:17:26.068572
48	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	1000	t	\N	2026-06-24 23:17:26.071	2026-06-24 20:17:26.068572
49	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	58.15	t	\N	2026-06-24 23:17:26.072	2026-06-24 20:17:26.068572
50	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	1457	t	\N	2026-06-24 23:17:26.073	2026-06-24 20:17:26.068572
51	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	25.85	t	\N	2026-06-24 23:18:26.015	2026-06-24 20:18:26.014591
52	TANK_BASINCI	Tank Basıncı	unknown	bar	0.69	t	\N	2026-06-24 23:18:26.016	2026-06-24 20:18:26.014591
53	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	1000	t	\N	2026-06-24 23:18:26.017	2026-06-24 20:18:26.014591
54	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	58.15	t	\N	2026-06-24 23:18:26.018	2026-06-24 20:18:26.014591
55	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	1457	t	\N	2026-06-24 23:18:26.018	2026-06-24 20:18:26.014591
56	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	35	t	\N	2026-06-24 23:19:26.029	2026-06-24 20:19:26.028885
57	TANK_BASINCI	Tank Basıncı	unknown	bar	2	t	\N	2026-06-24 23:19:26.032	2026-06-24 20:19:26.028885
58	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	950	t	\N	2026-06-24 23:19:26.033	2026-06-24 20:19:26.028885
59	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	15	t	\N	2026-06-24 23:19:26.034	2026-06-24 20:19:26.028885
60	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	965	t	\N	2026-06-24 23:19:26.035	2026-06-24 20:19:26.028885
61	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	35	t	\N	2026-06-24 23:20:26.033	2026-06-24 20:20:26.032179
62	TANK_BASINCI	Tank Basıncı	unknown	bar	2	t	\N	2026-06-24 23:20:26.035	2026-06-24 20:20:26.032179
63	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	950	t	\N	2026-06-24 23:20:26.036	2026-06-24 20:20:26.032179
64	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	15	t	\N	2026-06-24 23:20:26.036	2026-06-24 20:20:26.032179
65	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	965	t	\N	2026-06-24 23:20:26.037	2026-06-24 20:20:26.032179
66	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	35	t	\N	2026-06-24 23:21:26.041	2026-06-24 20:21:26.040965
67	TANK_BASINCI	Tank Basıncı	unknown	bar	2	t	\N	2026-06-24 23:21:26.043	2026-06-24 20:21:26.040965
68	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	950	t	\N	2026-06-24 23:21:26.053	2026-06-24 20:21:26.040965
69	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	15	t	\N	2026-06-24 23:21:26.054	2026-06-24 20:21:26.040965
70	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	965	t	\N	2026-06-24 23:21:26.055	2026-06-24 20:21:26.040965
71	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	35	t	\N	2026-06-24 23:22:26.057	2026-06-24 20:22:26.056898
72	TANK_BASINCI	Tank Basıncı	unknown	bar	2	t	\N	2026-06-24 23:22:26.06	2026-06-24 20:22:26.056898
73	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	950	t	\N	2026-06-24 23:22:26.061	2026-06-24 20:22:26.056898
74	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	15	t	\N	2026-06-24 23:22:26.062	2026-06-24 20:22:26.056898
75	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	965	t	\N	2026-06-24 23:22:26.063	2026-06-24 20:22:26.056898
76	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	35	t	\N	2026-06-24 23:23:26.069	2026-06-24 20:23:26.068922
77	TANK_BASINCI	Tank Basıncı	unknown	bar	2	t	\N	2026-06-24 23:23:26.071	2026-06-24 20:23:26.068922
78	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	950	t	\N	2026-06-24 23:23:26.071	2026-06-24 20:23:26.068922
79	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	15	t	\N	2026-06-24 23:23:26.072	2026-06-24 20:23:26.068922
80	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	965	t	\N	2026-06-24 23:23:26.073	2026-06-24 20:23:26.068922
81	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	35	t	\N	2026-06-24 23:24:26.071	2026-06-24 20:24:26.071107
82	TANK_BASINCI	Tank Basıncı	unknown	bar	2	t	\N	2026-06-24 23:24:26.073	2026-06-24 20:24:26.071107
83	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	950	t	\N	2026-06-24 23:24:26.073	2026-06-24 20:24:26.071107
84	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	15	t	\N	2026-06-24 23:24:26.074	2026-06-24 20:24:26.071107
85	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	965	t	\N	2026-06-24 23:24:26.075	2026-06-24 20:24:26.071107
86	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	35	t	\N	2026-06-24 23:25:26.084	2026-06-24 20:25:26.083565
87	TANK_BASINCI	Tank Basıncı	unknown	bar	2	t	\N	2026-06-24 23:25:26.086	2026-06-24 20:25:26.083565
88	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	950	t	\N	2026-06-24 23:25:26.086	2026-06-24 20:25:26.083565
89	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	15	t	\N	2026-06-24 23:25:26.087	2026-06-24 20:25:26.083565
90	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	965	t	\N	2026-06-24 23:25:26.088	2026-06-24 20:25:26.083565
91	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	35	t	\N	2026-06-24 23:26:26.091	2026-06-24 20:26:26.091181
92	TANK_BASINCI	Tank Basıncı	unknown	bar	2	t	\N	2026-06-24 23:26:26.093	2026-06-24 20:26:26.091181
93	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	950	t	\N	2026-06-24 23:26:26.093	2026-06-24 20:26:26.091181
94	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	15	t	\N	2026-06-24 23:26:26.094	2026-06-24 20:26:26.091181
95	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	965	t	\N	2026-06-24 23:26:26.095	2026-06-24 20:26:26.091181
96	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	35	t	\N	2026-06-24 23:27:26.102	2026-06-24 20:27:26.101343
97	TANK_BASINCI	Tank Basıncı	unknown	bar	2	t	\N	2026-06-24 23:27:26.104	2026-06-24 20:27:26.101343
98	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	950	t	\N	2026-06-24 23:27:26.105	2026-06-24 20:27:26.101343
99	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	15	t	\N	2026-06-24 23:27:26.106	2026-06-24 20:27:26.101343
100	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	965	t	\N	2026-06-24 23:27:26.107	2026-06-24 20:27:26.101343
101	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	35	t	\N	2026-06-24 23:28:26.103	2026-06-24 20:28:26.102446
102	TANK_BASINCI	Tank Basıncı	unknown	bar	2	t	\N	2026-06-24 23:28:26.104	2026-06-24 20:28:26.102446
103	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	950	t	\N	2026-06-24 23:28:26.105	2026-06-24 20:28:26.102446
104	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	15	t	\N	2026-06-24 23:28:26.105	2026-06-24 20:28:26.102446
105	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	965	t	\N	2026-06-24 23:28:26.106	2026-06-24 20:28:26.102446
106	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	35	t	\N	2026-06-24 23:29:26.116	2026-06-24 20:29:26.11539
107	TANK_BASINCI	Tank Basıncı	unknown	bar	2	t	\N	2026-06-24 23:29:26.118	2026-06-24 20:29:26.11539
108	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	950	t	\N	2026-06-24 23:29:26.12	2026-06-24 20:29:26.11539
109	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	15	t	\N	2026-06-24 23:29:26.12	2026-06-24 20:29:26.11539
110	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	965	t	\N	2026-06-24 23:29:26.121	2026-06-24 20:29:26.11539
111	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	35	t	\N	2026-06-24 23:30:26.124	2026-06-24 20:30:26.123354
112	TANK_BASINCI	Tank Basıncı	unknown	bar	2	t	\N	2026-06-24 23:30:26.126	2026-06-24 20:30:26.123354
113	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	950	t	\N	2026-06-24 23:30:26.127	2026-06-24 20:30:26.123354
114	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	15	t	\N	2026-06-24 23:30:26.128	2026-06-24 20:30:26.123354
115	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	965	t	\N	2026-06-24 23:30:26.129	2026-06-24 20:30:26.123354
116	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	35	t	\N	2026-06-24 23:31:26.137	2026-06-24 20:31:26.136623
117	TANK_BASINCI	Tank Basıncı	unknown	bar	2	t	\N	2026-06-24 23:31:26.138	2026-06-24 20:31:26.136623
118	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	950	t	\N	2026-06-24 23:31:26.139	2026-06-24 20:31:26.136623
119	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	15	t	\N	2026-06-24 23:31:26.14	2026-06-24 20:31:26.136623
120	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	965	t	\N	2026-06-24 23:31:26.14	2026-06-24 20:31:26.136623
121	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	35	t	\N	2026-06-24 23:32:26.144	2026-06-24 20:32:26.14382
122	TANK_BASINCI	Tank Basıncı	unknown	bar	2	t	\N	2026-06-24 23:32:26.146	2026-06-24 20:32:26.14382
123	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	950	t	\N	2026-06-24 23:32:26.147	2026-06-24 20:32:26.14382
124	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	15	t	\N	2026-06-24 23:32:26.148	2026-06-24 20:32:26.14382
125	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	965	t	\N	2026-06-24 23:32:26.149	2026-06-24 20:32:26.14382
126	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	35	t	\N	2026-06-24 23:33:26.157	2026-06-24 20:33:26.156801
127	TANK_BASINCI	Tank Basıncı	unknown	bar	2	t	\N	2026-06-24 23:33:26.16	2026-06-24 20:33:26.156801
128	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	950	t	\N	2026-06-24 23:33:26.161	2026-06-24 20:33:26.156801
129	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	15	t	\N	2026-06-24 23:33:26.162	2026-06-24 20:33:26.156801
130	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	965	t	\N	2026-06-24 23:33:26.163	2026-06-24 20:33:26.156801
131	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	35	t	\N	2026-06-24 23:34:26.166	2026-06-24 20:34:26.166146
132	TANK_BASINCI	Tank Basıncı	unknown	bar	2	t	\N	2026-06-24 23:34:26.168	2026-06-24 20:34:26.166146
133	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	950	t	\N	2026-06-24 23:34:26.169	2026-06-24 20:34:26.166146
134	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	15	t	\N	2026-06-24 23:34:26.169	2026-06-24 20:34:26.166146
135	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	965	t	\N	2026-06-24 23:34:26.17	2026-06-24 20:34:26.166146
136	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	35	t	\N	2026-06-24 23:35:26.179	2026-06-24 20:35:26.178185
137	TANK_BASINCI	Tank Basıncı	unknown	bar	2	t	\N	2026-06-24 23:35:26.182	2026-06-24 20:35:26.178185
138	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	950	t	\N	2026-06-24 23:35:26.183	2026-06-24 20:35:26.178185
139	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	15	t	\N	2026-06-24 23:35:26.184	2026-06-24 20:35:26.178185
140	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	965	t	\N	2026-06-24 23:35:26.185	2026-06-24 20:35:26.178185
141	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	32	t	\N	2026-06-24 23:37:59.122	2026-06-24 20:37:59.122052
142	TANK_BASINCI	Tank Basıncı	unknown	bar	3	t	\N	2026-06-24 23:37:59.127	2026-06-24 20:37:59.122052
143	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	850	t	\N	2026-06-24 23:37:59.129	2026-06-24 20:37:59.122052
144	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	25	t	\N	2026-06-24 23:37:59.13	2026-06-24 20:37:59.122052
145	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	600	t	\N	2026-06-24 23:37:59.131	2026-06-24 20:37:59.122052
146	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	32	t	\N	2026-06-24 23:38:59.131	2026-06-24 20:38:59.131051
147	TANK_BASINCI	Tank Basıncı	unknown	bar	3	t	\N	2026-06-24 23:38:59.133	2026-06-24 20:38:59.131051
148	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	850	t	\N	2026-06-24 23:38:59.134	2026-06-24 20:38:59.131051
149	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	25	t	\N	2026-06-24 23:38:59.135	2026-06-24 20:38:59.131051
150	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	600	t	\N	2026-06-24 23:38:59.135	2026-06-24 20:38:59.131051
151	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	32	t	\N	2026-06-24 23:39:59.14	2026-06-24 20:39:59.139131
152	TANK_BASINCI	Tank Basıncı	unknown	bar	3	t	\N	2026-06-24 23:39:59.142	2026-06-24 20:39:59.139131
153	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	850	t	\N	2026-06-24 23:39:59.142	2026-06-24 20:39:59.139131
154	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	25	t	\N	2026-06-24 23:39:59.143	2026-06-24 20:39:59.139131
155	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	600	t	\N	2026-06-24 23:39:59.143	2026-06-24 20:39:59.139131
156	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	32	t	\N	2026-06-24 23:40:59.156	2026-06-24 20:40:59.156476
157	TANK_BASINCI	Tank Basıncı	unknown	bar	3	t	\N	2026-06-24 23:40:59.158	2026-06-24 20:40:59.156476
158	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	850	t	\N	2026-06-24 23:40:59.159	2026-06-24 20:40:59.156476
159	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	25	t	\N	2026-06-24 23:40:59.16	2026-06-24 20:40:59.156476
160	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	600	t	\N	2026-06-24 23:40:59.161	2026-06-24 20:40:59.156476
161	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	32	t	\N	2026-06-24 23:41:59.169	2026-06-24 20:41:59.169373
162	TANK_BASINCI	Tank Basıncı	unknown	bar	3	t	\N	2026-06-24 23:41:59.171	2026-06-24 20:41:59.169373
163	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	850	t	\N	2026-06-24 23:41:59.172	2026-06-24 20:41:59.169373
164	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	25	t	\N	2026-06-24 23:41:59.173	2026-06-24 20:41:59.169373
165	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	600	t	\N	2026-06-24 23:41:59.173	2026-06-24 20:41:59.169373
166	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	32	t	\N	2026-06-24 23:42:59.17	2026-06-24 20:42:59.170414
167	TANK_BASINCI	Tank Basıncı	unknown	bar	3	t	\N	2026-06-24 23:42:59.172	2026-06-24 20:42:59.170414
168	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	850	t	\N	2026-06-24 23:42:59.174	2026-06-24 20:42:59.170414
169	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	25	t	\N	2026-06-24 23:42:59.176	2026-06-24 20:42:59.170414
170	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	600	t	\N	2026-06-24 23:42:59.177	2026-06-24 20:42:59.170414
171	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	32	t	\N	2026-06-24 23:43:59.182	2026-06-24 20:43:59.181974
172	TANK_BASINCI	Tank Basıncı	unknown	bar	3	t	\N	2026-06-24 23:43:59.185	2026-06-24 20:43:59.181974
173	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	850	t	\N	2026-06-24 23:43:59.185	2026-06-24 20:43:59.181974
174	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	25	t	\N	2026-06-24 23:43:59.187	2026-06-24 20:43:59.181974
175	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	600	t	\N	2026-06-24 23:43:59.188	2026-06-24 20:43:59.181974
176	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	32	t	\N	2026-06-24 23:51:03.263	2026-06-24 20:51:03.261371
177	TANK_BASINCI	Tank Basıncı	unknown	bar	3	t	\N	2026-06-24 23:51:03.267	2026-06-24 20:51:03.261371
178	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	850	t	\N	2026-06-24 23:51:03.269	2026-06-24 20:51:03.261371
179	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	25	t	\N	2026-06-24 23:51:03.27	2026-06-24 20:51:03.261371
180	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	600	t	\N	2026-06-24 23:51:03.271	2026-06-24 20:51:03.261371
181	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	32	t	\N	2026-06-24 23:52:03.276	2026-06-24 20:52:03.276254
182	TANK_BASINCI	Tank Basıncı	unknown	bar	3	t	\N	2026-06-24 23:52:03.285	2026-06-24 20:52:03.276254
183	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	850	t	\N	2026-06-24 23:52:03.29	2026-06-24 20:52:03.276254
184	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	25	t	\N	2026-06-24 23:52:03.292	2026-06-24 20:52:03.276254
185	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	600	t	\N	2026-06-24 23:52:03.293	2026-06-24 20:52:03.276254
186	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	32	t	\N	2026-06-24 23:53:03.281	2026-06-24 20:53:03.280759
187	TANK_BASINCI	Tank Basıncı	unknown	bar	3	t	\N	2026-06-24 23:53:03.283	2026-06-24 20:53:03.280759
188	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	850	t	\N	2026-06-24 23:53:03.283	2026-06-24 20:53:03.280759
189	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	25	t	\N	2026-06-24 23:53:03.284	2026-06-24 20:53:03.280759
190	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	600	t	\N	2026-06-24 23:53:03.285	2026-06-24 20:53:03.280759
191	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	32	t	\N	2026-06-24 23:54:03.289	2026-06-24 20:54:03.288693
192	TANK_BASINCI	Tank Basıncı	unknown	bar	3	t	\N	2026-06-24 23:54:03.29	2026-06-24 20:54:03.288693
193	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	850	t	\N	2026-06-24 23:54:03.291	2026-06-24 20:54:03.288693
194	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	25	t	\N	2026-06-24 23:54:03.292	2026-06-24 20:54:03.288693
195	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	600	t	\N	2026-06-24 23:54:03.292	2026-06-24 20:54:03.288693
196	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	32	t	\N	2026-06-24 23:55:03.355	2026-06-24 20:55:03.355693
197	TANK_BASINCI	Tank Basıncı	unknown	bar	3	t	\N	2026-06-24 23:55:03.357	2026-06-24 20:55:03.355693
198	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	850	t	\N	2026-06-24 23:55:03.358	2026-06-24 20:55:03.355693
199	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	25	t	\N	2026-06-24 23:55:03.359	2026-06-24 20:55:03.355693
200	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	600	t	\N	2026-06-24 23:55:03.361	2026-06-24 20:55:03.355693
201	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	32	t	\N	2026-06-24 23:56:17.707	2026-06-24 20:56:17.708248
202	TANK_BASINCI	Tank Basıncı	unknown	bar	3	t	\N	2026-06-24 23:56:17.712	2026-06-24 20:56:17.708248
203	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	850	t	\N	2026-06-24 23:56:17.713	2026-06-24 20:56:17.708248
204	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	25	t	\N	2026-06-24 23:56:17.714	2026-06-24 20:56:17.708248
205	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	600	t	\N	2026-06-24 23:56:17.715	2026-06-24 20:56:17.708248
206	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	32	t	\N	2026-06-24 23:57:37.682	2026-06-24 20:57:37.681956
207	TANK_BASINCI	Tank Basıncı	unknown	bar	3	t	\N	2026-06-24 23:57:37.685	2026-06-24 20:57:37.681956
208	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	850	t	\N	2026-06-24 23:57:37.686	2026-06-24 20:57:37.681956
209	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	25	t	\N	2026-06-24 23:57:37.687	2026-06-24 20:57:37.681956
210	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	600	t	\N	2026-06-24 23:57:37.688	2026-06-24 20:57:37.681956
211	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	32	t	\N	2026-06-24 23:58:37.691	2026-06-24 20:58:37.691687
212	TANK_BASINCI	Tank Basıncı	unknown	bar	3	t	\N	2026-06-24 23:58:37.693	2026-06-24 20:58:37.691687
213	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	850	t	\N	2026-06-24 23:58:37.694	2026-06-24 20:58:37.691687
214	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	25	t	\N	2026-06-24 23:58:37.695	2026-06-24 20:58:37.691687
215	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	600	t	\N	2026-06-24 23:58:37.695	2026-06-24 20:58:37.691687
216	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	32	t	\N	2026-06-24 23:59:37.701	2026-06-24 20:59:37.700231
217	TANK_BASINCI	Tank Basıncı	unknown	bar	3	t	\N	2026-06-24 23:59:37.702	2026-06-24 20:59:37.700231
218	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	850	t	\N	2026-06-24 23:59:37.704	2026-06-24 20:59:37.700231
219	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	25	t	\N	2026-06-24 23:59:37.704	2026-06-24 20:59:37.700231
220	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	600	t	\N	2026-06-24 23:59:37.705	2026-06-24 20:59:37.700231
221	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	32	t	\N	2026-06-25 00:00:37.711	2026-06-24 21:00:37.710892
222	TANK_BASINCI	Tank Basıncı	unknown	bar	3	t	\N	2026-06-25 00:00:37.713	2026-06-24 21:00:37.710892
223	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	850	t	\N	2026-06-25 00:00:37.714	2026-06-24 21:00:37.710892
224	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	25	t	\N	2026-06-25 00:00:37.715	2026-06-24 21:00:37.710892
225	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	600	t	\N	2026-06-25 00:00:37.716	2026-06-24 21:00:37.710892
226	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	28	t	\N	2026-06-25 00:01:37.717	2026-06-24 21:01:37.717684
227	TANK_BASINCI	Tank Basıncı	unknown	bar	5	t	\N	2026-06-25 00:01:37.72	2026-06-24 21:01:37.717684
228	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	450	t	\N	2026-06-25 00:01:37.721	2026-06-24 21:01:37.717684
229	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	65	t	\N	2026-06-25 00:01:37.721	2026-06-24 21:01:37.717684
230	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	780	t	\N	2026-06-25 00:01:37.722	2026-06-24 21:01:37.717684
231	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	28	t	\N	2026-06-25 00:02:37.72	2026-06-24 21:02:37.720425
232	TANK_BASINCI	Tank Basıncı	unknown	bar	5	t	\N	2026-06-25 00:02:37.723	2026-06-24 21:02:37.720425
233	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	450	t	\N	2026-06-25 00:02:37.724	2026-06-24 21:02:37.720425
234	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	65	t	\N	2026-06-25 00:02:37.725	2026-06-24 21:02:37.720425
235	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	780	t	\N	2026-06-25 00:02:37.726	2026-06-24 21:02:37.720425
236	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	28	t	\N	2026-06-25 00:03:37.726	2026-06-24 21:03:37.726894
237	TANK_BASINCI	Tank Basıncı	unknown	bar	5	t	\N	2026-06-25 00:03:37.729	2026-06-24 21:03:37.726894
238	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	450	t	\N	2026-06-25 00:03:37.731	2026-06-24 21:03:37.726894
239	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	65	t	\N	2026-06-25 00:03:37.733	2026-06-24 21:03:37.726894
240	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	780	t	\N	2026-06-25 00:03:37.734	2026-06-24 21:03:37.726894
241	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	28	t	\N	2026-06-25 00:04:32.681	2026-06-24 21:04:32.680157
242	TANK_BASINCI	Tank Basıncı	unknown	bar	5	t	\N	2026-06-25 00:04:32.683	2026-06-24 21:04:32.680157
243	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	450	t	\N	2026-06-25 00:04:32.684	2026-06-24 21:04:32.680157
244	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	65	t	\N	2026-06-25 00:04:32.685	2026-06-24 21:04:32.680157
245	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	780	t	\N	2026-06-25 00:04:32.687	2026-06-24 21:04:32.680157
246	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	39	t	\N	2026-06-25 00:05:32.693	2026-06-24 21:05:32.693204
247	TANK_BASINCI	Tank Basıncı	unknown	bar	8	t	\N	2026-06-25 00:05:32.695	2026-06-24 21:05:32.693204
248	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	965	t	\N	2026-06-25 00:05:32.696	2026-06-24 21:05:32.693204
249	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	25	t	\N	2026-06-25 00:05:32.696	2026-06-24 21:05:32.693204
250	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	900	t	\N	2026-06-25 00:05:32.697	2026-06-24 21:05:32.693204
251	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	39	t	\N	2026-06-25 00:06:32.705	2026-06-24 21:06:32.705711
252	TANK_BASINCI	Tank Basıncı	unknown	bar	8	t	\N	2026-06-25 00:06:32.707	2026-06-24 21:06:32.705711
253	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	965	t	\N	2026-06-25 00:06:32.708	2026-06-24 21:06:32.705711
254	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	25	t	\N	2026-06-25 00:06:32.709	2026-06-24 21:06:32.705711
255	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	900	t	\N	2026-06-25 00:06:32.71	2026-06-24 21:06:32.705711
256	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	14	t	\N	2026-06-25 00:07:32.708	2026-06-24 21:07:32.708434
257	TANK_BASINCI	Tank Basıncı	unknown	bar	12	t	\N	2026-06-25 00:07:32.712	2026-06-24 21:07:32.708434
258	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	1000	t	\N	2026-06-25 00:07:32.713	2026-06-24 21:07:32.708434
259	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	63	t	\N	2026-06-25 00:07:32.714	2026-06-24 21:07:32.708434
260	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	600	t	\N	2026-06-25 00:07:32.715	2026-06-24 21:07:32.708434
261	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	14	t	\N	2026-06-25 00:10:15.691	2026-06-24 21:10:15.691537
262	TANK_BASINCI	Tank Basıncı	unknown	bar	12	t	\N	2026-06-25 00:10:15.695	2026-06-24 21:10:15.691537
263	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	1000	t	\N	2026-06-25 00:10:15.697	2026-06-24 21:10:15.691537
264	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	63	t	\N	2026-06-25 00:10:15.699	2026-06-24 21:10:15.691537
265	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	600	t	\N	2026-06-25 00:10:15.7	2026-06-24 21:10:15.691537
266	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	15.9	t	\N	2026-06-25 00:11:15.691	2026-06-24 21:11:15.69222
267	TANK_BASINCI	Tank Basıncı	unknown	bar	5.9	t	\N	2026-06-25 00:11:15.692	2026-06-24 21:11:15.69222
268	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	900	t	\N	2026-06-25 00:11:15.694	2026-06-24 21:11:15.69222
269	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	50	t	\N	2026-06-25 00:11:15.695	2026-06-24 21:11:15.69222
270	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	821	t	\N	2026-06-25 00:11:15.696	2026-06-24 21:11:15.69222
271	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	13.8	t	\N	2026-06-25 00:13:43.063	2026-06-24 21:13:43.064703
272	TANK_BASINCI	Tank Basıncı	unknown	bar	5.9	t	\N	2026-06-25 00:13:43.065	2026-06-24 21:13:43.064703
273	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	820	t	\N	2026-06-25 00:13:43.066	2026-06-24 21:13:43.064703
274	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	62.5	t	\N	2026-06-25 00:13:43.066	2026-06-24 21:13:43.064703
275	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	69	t	\N	2026-06-25 00:13:43.067	2026-06-24 21:13:43.064703
276	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	15	t	\N	2026-06-25 00:14:43.077	2026-06-24 21:14:43.077555
277	TANK_BASINCI	Tank Basıncı	unknown	bar	6	t	\N	2026-06-25 00:14:43.081	2026-06-24 21:14:43.077555
278	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	800	t	\N	2026-06-25 00:14:43.084	2026-06-24 21:14:43.077555
279	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	36	t	\N	2026-06-25 00:14:43.085	2026-06-24 21:14:43.077555
280	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	42	t	\N	2026-06-25 00:14:43.086	2026-06-24 21:14:43.077555
281	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	69	t	\N	2026-06-25 00:18:25.996	2026-06-24 21:18:25.995129
282	TANK_BASINCI	Tank Basıncı	unknown	bar	43	t	\N	2026-06-25 00:18:26	2026-06-24 21:18:25.995129
283	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	800	t	\N	2026-06-25 00:18:26.001	2026-06-24 21:18:25.995129
284	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	36	t	\N	2026-06-25 00:18:26.004	2026-06-24 21:18:25.995129
285	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	42	t	\N	2026-06-25 00:18:26.006	2026-06-24 21:18:25.995129
286	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	324	t	\N	2026-06-25 00:23:35.185	2026-06-24 21:23:35.18495
287	TANK_BASINCI	Tank Basıncı	unknown	bar	123	t	\N	2026-06-25 00:23:35.187	2026-06-24 21:23:35.18495
288	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	12	t	\N	2026-06-25 00:23:35.188	2026-06-24 21:23:35.18495
289	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	854.4	t	\N	2026-06-25 00:23:35.189	2026-06-24 21:23:35.18495
290	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	123	t	\N	2026-06-25 00:23:35.19	2026-06-24 21:23:35.18495
291	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	34	t	\N	2026-06-25 00:24:35.19	2026-06-24 21:24:35.190291
292	TANK_BASINCI	Tank Basıncı	unknown	bar	23	t	\N	2026-06-25 00:24:35.192	2026-06-24 21:24:35.190291
293	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	6	t	\N	2026-06-25 00:24:35.193	2026-06-24 21:24:35.190291
294	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	900	t	\N	2026-06-25 00:24:35.194	2026-06-24 21:24:35.190291
295	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	90	t	\N	2026-06-25 00:24:35.195	2026-06-24 21:24:35.190291
296	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	34	t	\N	2026-06-25 00:37:29.686	2026-06-24 21:37:29.685025
297	TANK_BASINCI	Tank Basıncı	unknown	bar	23	t	\N	2026-06-25 00:37:29.691	2026-06-24 21:37:29.685025
298	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	45	t	\N	2026-06-25 00:37:29.693	2026-06-24 21:37:29.685025
299	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	78	t	\N	2026-06-25 00:37:29.694	2026-06-24 21:37:29.685025
300	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	42	t	\N	2026-06-25 00:37:29.696	2026-06-24 21:37:29.685025
301	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	34	t	\N	2026-06-25 00:38:29.688	2026-06-24 21:38:29.688464
302	TANK_BASINCI	Tank Basıncı	unknown	bar	23	t	\N	2026-06-25 00:38:29.69	2026-06-24 21:38:29.688464
303	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	45	t	\N	2026-06-25 00:38:29.69	2026-06-24 21:38:29.688464
304	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	78	t	\N	2026-06-25 00:38:29.691	2026-06-24 21:38:29.688464
305	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	42	t	\N	2026-06-25 00:38:29.691	2026-06-24 21:38:29.688464
306	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	34	t	\N	2026-06-25 00:39:29.703	2026-06-24 21:39:29.703493
307	TANK_BASINCI	Tank Basıncı	unknown	bar	23	t	\N	2026-06-25 00:39:29.707	2026-06-24 21:39:29.703493
308	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	45	t	\N	2026-06-25 00:39:29.708	2026-06-24 21:39:29.703493
309	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	78	t	\N	2026-06-25 00:39:29.709	2026-06-24 21:39:29.703493
310	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	42	t	\N	2026-06-25 00:39:29.71	2026-06-24 21:39:29.703493
311	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	34	t	\N	2026-06-25 00:40:29.712	2026-06-24 21:40:29.711947
312	TANK_BASINCI	Tank Basıncı	unknown	bar	23	t	\N	2026-06-25 00:40:29.715	2026-06-24 21:40:29.711947
313	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	45	t	\N	2026-06-25 00:40:29.716	2026-06-24 21:40:29.711947
314	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	78	t	\N	2026-06-25 00:40:29.717	2026-06-24 21:40:29.711947
315	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	42	t	\N	2026-06-25 00:40:29.717	2026-06-24 21:40:29.711947
316	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	34	t	\N	2026-06-25 00:50:21.925	2026-06-24 21:50:21.923632
317	TANK_BASINCI	Tank Basıncı	unknown	bar	23	t	\N	2026-06-25 00:50:21.928	2026-06-24 21:50:21.923632
318	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	45	t	\N	2026-06-25 00:50:21.929	2026-06-24 21:50:21.923632
319	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	78	t	\N	2026-06-25 00:50:21.931	2026-06-24 21:50:21.923632
320	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	42	t	\N	2026-06-25 00:50:21.931	2026-06-24 21:50:21.923632
321	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	965	t	\N	2026-06-25 00:51:21.938	2026-06-24 21:51:21.937476
322	TANK_BASINCI	Tank Basıncı	unknown	bar	345	t	\N	2026-06-25 00:51:21.939	2026-06-24 21:51:21.937476
323	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	642	t	\N	2026-06-25 00:51:21.94	2026-06-24 21:51:21.937476
324	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	12	t	\N	2026-06-25 00:51:21.941	2026-06-24 21:51:21.937476
325	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	53	t	\N	2026-06-25 00:51:21.941	2026-06-24 21:51:21.937476
326	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	965	t	\N	2026-06-25 01:00:29.344	2026-06-24 22:00:29.344396
327	TANK_BASINCI	Tank Basıncı	unknown	bar	345	t	\N	2026-06-25 01:00:29.348	2026-06-24 22:00:29.344396
328	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	642	t	\N	2026-06-25 01:00:29.35	2026-06-24 22:00:29.344396
329	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	13	t	\N	2026-06-25 01:00:29.353	2026-06-24 22:00:29.344396
330	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	4	t	\N	2026-06-25 01:00:29.354	2026-06-24 22:00:29.344396
331	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	965	t	\N	2026-06-25 01:01:29.365	2026-06-24 22:01:29.366113
332	TANK_BASINCI	Tank Basıncı	unknown	bar	345	t	\N	2026-06-25 01:01:29.367	2026-06-24 22:01:29.366113
333	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	642	t	\N	2026-06-25 01:01:29.368	2026-06-24 22:01:29.366113
334	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	13	t	\N	2026-06-25 01:01:29.369	2026-06-24 22:01:29.366113
335	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	4	t	\N	2026-06-25 01:01:29.37	2026-06-24 22:01:29.366113
336	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	965	t	\N	2026-06-25 01:02:29.381	2026-06-24 22:02:29.381095
337	TANK_BASINCI	Tank Basıncı	unknown	bar	345	t	\N	2026-06-25 01:02:29.383	2026-06-24 22:02:29.381095
338	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	642	t	\N	2026-06-25 01:02:29.384	2026-06-24 22:02:29.381095
339	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	13	t	\N	2026-06-25 01:02:29.385	2026-06-24 22:02:29.381095
340	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	4	t	\N	2026-06-25 01:02:29.385	2026-06-24 22:02:29.381095
341	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	965	t	\N	2026-06-25 01:04:14.757	2026-06-24 22:04:14.756891
342	TANK_BASINCI	Tank Basıncı	unknown	bar	345	t	\N	2026-06-25 01:04:14.758	2026-06-24 22:04:14.756891
343	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	642	t	\N	2026-06-25 01:04:14.759	2026-06-24 22:04:14.756891
344	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	13	t	\N	2026-06-25 01:04:14.76	2026-06-24 22:04:14.756891
345	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	4	t	\N	2026-06-25 01:04:14.762	2026-06-24 22:04:14.756891
346	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	965	t	\N	2026-06-25 01:05:14.768	2026-06-24 22:05:14.768968
347	TANK_BASINCI	Tank Basıncı	unknown	bar	345	t	\N	2026-06-25 01:05:14.771	2026-06-24 22:05:14.768968
348	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	642	t	\N	2026-06-25 01:05:14.772	2026-06-24 22:05:14.768968
349	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	13	t	\N	2026-06-25 01:05:14.773	2026-06-24 22:05:14.768968
350	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	4	t	\N	2026-06-25 01:05:14.774	2026-06-24 22:05:14.768968
351	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	43	t	\N	2026-06-25 01:11:04.705	2026-06-24 22:11:04.705251
352	TANK_BASINCI	Tank Basıncı	unknown	bar	23	t	\N	2026-06-25 01:11:04.706	2026-06-24 22:11:04.705251
353	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	642	t	\N	2026-06-25 01:11:04.707	2026-06-24 22:11:04.705251
354	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	13	t	\N	2026-06-25 01:11:04.707	2026-06-24 22:11:04.705251
355	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	4	t	\N	2026-06-25 01:11:04.709	2026-06-24 22:11:04.705251
356	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	43	t	\N	2026-06-25 01:12:04.723	2026-06-24 22:12:04.722159
357	TANK_BASINCI	Tank Basıncı	unknown	bar	23	t	\N	2026-06-25 01:12:04.726	2026-06-24 22:12:04.722159
358	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	44	t	\N	2026-06-25 01:12:04.726	2026-06-24 22:12:04.722159
359	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	23	t	\N	2026-06-25 01:12:04.727	2026-06-24 22:12:04.722159
360	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	55	t	\N	2026-06-25 01:12:04.728	2026-06-24 22:12:04.722159
361	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	43	t	\N	2026-06-25 01:13:04.724	2026-06-24 22:13:04.724402
362	TANK_BASINCI	Tank Basıncı	unknown	bar	23	t	\N	2026-06-25 01:13:04.727	2026-06-24 22:13:04.724402
363	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	44	t	\N	2026-06-25 01:13:04.728	2026-06-24 22:13:04.724402
364	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	23	t	\N	2026-06-25 01:13:04.729	2026-06-24 22:13:04.724402
365	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	55	t	\N	2026-06-25 01:13:04.73	2026-06-24 22:13:04.724402
366	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	43	t	\N	2026-06-25 01:14:04.73	2026-06-24 22:14:04.729822
367	TANK_BASINCI	Tank Basıncı	unknown	bar	23	t	\N	2026-06-25 01:14:04.732	2026-06-24 22:14:04.729822
368	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	44	t	\N	2026-06-25 01:14:04.732	2026-06-24 22:14:04.729822
369	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	23	t	\N	2026-06-25 01:14:04.733	2026-06-24 22:14:04.729822
370	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	55	t	\N	2026-06-25 01:14:04.734	2026-06-24 22:14:04.729822
371	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	43	t	\N	2026-06-25 01:15:04.745	2026-06-24 22:15:04.745586
372	TANK_BASINCI	Tank Basıncı	unknown	bar	23	t	\N	2026-06-25 01:15:04.748	2026-06-24 22:15:04.745586
373	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	44	t	\N	2026-06-25 01:15:04.749	2026-06-24 22:15:04.745586
374	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	23	t	\N	2026-06-25 01:15:04.75	2026-06-24 22:15:04.745586
375	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	55	t	\N	2026-06-25 01:15:04.751	2026-06-24 22:15:04.745586
376	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	12	t	\N	2026-06-25 23:12:27.153	2026-06-25 20:12:27.152402
377	TANK_BASINCI	Tank Basıncı	unknown	bar	54	t	\N	2026-06-25 23:12:27.159	2026-06-25 20:12:27.152402
378	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	0	t	\N	2026-06-25 23:12:27.16	2026-06-25 20:12:27.152402
379	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	0	t	\N	2026-06-25 23:12:27.161	2026-06-25 20:12:27.152402
380	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	0	t	\N	2026-06-25 23:12:27.162	2026-06-25 20:12:27.152402
381	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	96	t	\N	2026-06-25 23:13:27.165	2026-06-25 20:13:27.164281
382	TANK_BASINCI	Tank Basıncı	unknown	bar	42	t	\N	2026-06-25 23:13:27.166	2026-06-25 20:13:27.164281
383	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	74	t	\N	2026-06-25 23:13:27.167	2026-06-25 20:13:27.164281
384	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	78	t	\N	2026-06-25 23:13:27.168	2026-06-25 20:13:27.164281
385	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	14	t	\N	2026-06-25 23:13:27.169	2026-06-25 20:13:27.164281
386	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	23	t	\N	2026-06-25 23:14:27.179	2026-06-25 20:14:27.178492
387	TANK_BASINCI	Tank Basıncı	unknown	bar	41	t	\N	2026-06-25 23:14:27.182	2026-06-25 20:14:27.178492
388	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	85	t	\N	2026-06-25 23:14:27.183	2026-06-25 20:14:27.178492
389	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	45	t	\N	2026-06-25 23:14:27.184	2026-06-25 20:14:27.178492
390	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	14	t	\N	2026-06-25 23:14:27.184	2026-06-25 20:14:27.178492
391	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	85	t	\N	2026-06-25 23:22:46.326	2026-06-25 20:22:46.326763
392	TANK_BASINCI	Tank Basıncı	unknown	bar	14	t	\N	2026-06-25 23:22:46.327	2026-06-25 20:22:46.326763
393	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	63	t	\N	2026-06-25 23:22:46.327	2026-06-25 20:22:46.326763
394	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	12	t	\N	2026-06-25 23:22:46.328	2026-06-25 20:22:46.326763
395	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	74	t	\N	2026-06-25 23:22:46.329	2026-06-25 20:22:46.326763
396	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	24	t	\N	2026-06-25 23:23:46.339	2026-06-25 20:23:46.33949
397	TANK_BASINCI	Tank Basıncı	unknown	bar	14	t	\N	2026-06-25 23:23:46.341	2026-06-25 20:23:46.33949
398	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	44	t	\N	2026-06-25 23:23:46.348	2026-06-25 20:23:46.33949
399	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	14	t	\N	2026-06-25 23:23:46.349	2026-06-25 20:23:46.33949
400	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	14	t	\N	2026-06-25 23:23:46.35	2026-06-25 20:23:46.33949
401	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	24	t	\N	2026-06-25 23:24:46.343	2026-06-25 20:24:46.342624
402	TANK_BASINCI	Tank Basıncı	unknown	bar	14	t	\N	2026-06-25 23:24:46.347	2026-06-25 20:24:46.342624
403	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	44	t	\N	2026-06-25 23:24:46.348	2026-06-25 20:24:46.342624
404	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	14	t	\N	2026-06-25 23:24:46.349	2026-06-25 20:24:46.342624
405	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	14	t	\N	2026-06-25 23:24:46.35	2026-06-25 20:24:46.342624
406	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	24	t	\N	2026-06-25 23:25:46.351	2026-06-25 20:25:46.351272
407	TANK_BASINCI	Tank Basıncı	unknown	bar	14	t	\N	2026-06-25 23:25:46.352	2026-06-25 20:25:46.351272
408	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	44	t	\N	2026-06-25 23:25:46.353	2026-06-25 20:25:46.351272
409	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	14	t	\N	2026-06-25 23:25:46.354	2026-06-25 20:25:46.351272
410	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	14	t	\N	2026-06-25 23:25:46.355	2026-06-25 20:25:46.351272
411	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	24	t	\N	2026-06-25 23:26:46.362	2026-06-25 20:26:46.362381
412	TANK_BASINCI	Tank Basıncı	unknown	bar	14	t	\N	2026-06-25 23:26:46.364	2026-06-25 20:26:46.362381
413	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	44	t	\N	2026-06-25 23:26:46.364	2026-06-25 20:26:46.362381
414	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	14	t	\N	2026-06-25 23:26:46.365	2026-06-25 20:26:46.362381
415	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	14	t	\N	2026-06-25 23:26:46.366	2026-06-25 20:26:46.362381
416	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	24	t	\N	2026-06-25 23:27:46.368	2026-06-25 20:27:46.369464
417	TANK_BASINCI	Tank Basıncı	unknown	bar	14	t	\N	2026-06-25 23:27:46.37	2026-06-25 20:27:46.369464
418	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	44	t	\N	2026-06-25 23:27:46.371	2026-06-25 20:27:46.369464
419	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	14	t	\N	2026-06-25 23:27:46.372	2026-06-25 20:27:46.369464
420	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	14	t	\N	2026-06-25 23:27:46.373	2026-06-25 20:27:46.369464
421	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	24	t	\N	2026-06-25 23:28:46.368	2026-06-25 20:28:46.367996
422	TANK_BASINCI	Tank Basıncı	unknown	bar	14	t	\N	2026-06-25 23:28:46.369	2026-06-25 20:28:46.367996
423	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	44	t	\N	2026-06-25 23:28:46.37	2026-06-25 20:28:46.367996
424	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	14	t	\N	2026-06-25 23:28:46.371	2026-06-25 20:28:46.367996
425	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	14	t	\N	2026-06-25 23:28:46.372	2026-06-25 20:28:46.367996
426	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	24	t	\N	2026-06-25 23:29:46.384	2026-06-25 20:29:46.384752
427	TANK_BASINCI	Tank Basıncı	unknown	bar	14	t	\N	2026-06-25 23:29:46.386	2026-06-25 20:29:46.384752
428	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	44	t	\N	2026-06-25 23:29:46.387	2026-06-25 20:29:46.384752
429	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	14	t	\N	2026-06-25 23:29:46.388	2026-06-25 20:29:46.384752
430	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	14	t	\N	2026-06-25 23:29:46.389	2026-06-25 20:29:46.384752
431	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	24	t	\N	2026-06-25 23:30:46.386	2026-06-25 20:30:46.386186
432	TANK_BASINCI	Tank Basıncı	unknown	bar	14	t	\N	2026-06-25 23:30:46.388	2026-06-25 20:30:46.386186
433	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	44	t	\N	2026-06-25 23:30:46.389	2026-06-25 20:30:46.386186
434	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	14	t	\N	2026-06-25 23:30:46.39	2026-06-25 20:30:46.386186
435	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	14	t	\N	2026-06-25 23:30:46.391	2026-06-25 20:30:46.386186
436	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	24	t	\N	2026-06-25 23:31:46.391	2026-06-25 20:31:46.392924
437	TANK_BASINCI	Tank Basıncı	unknown	bar	14	t	\N	2026-06-25 23:31:46.393	2026-06-25 20:31:46.392924
438	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	44	t	\N	2026-06-25 23:31:46.394	2026-06-25 20:31:46.392924
439	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	14	t	\N	2026-06-25 23:31:46.394	2026-06-25 20:31:46.392924
440	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	14	t	\N	2026-06-25 23:31:46.395	2026-06-25 20:31:46.392924
441	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	24	t	\N	2026-06-25 23:32:46.406	2026-06-25 20:32:46.406487
442	TANK_BASINCI	Tank Basıncı	unknown	bar	14	t	\N	2026-06-25 23:32:46.409	2026-06-25 20:32:46.406487
443	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	44	t	\N	2026-06-25 23:32:46.41	2026-06-25 20:32:46.406487
444	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	14	t	\N	2026-06-25 23:32:46.411	2026-06-25 20:32:46.406487
445	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	14	t	\N	2026-06-25 23:32:46.412	2026-06-25 20:32:46.406487
446	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	24	t	\N	2026-06-25 23:33:46.41	2026-06-25 20:33:46.409542
447	TANK_BASINCI	Tank Basıncı	unknown	bar	14	t	\N	2026-06-25 23:33:46.412	2026-06-25 20:33:46.409542
448	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	44	t	\N	2026-06-25 23:33:46.413	2026-06-25 20:33:46.409542
449	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	14	t	\N	2026-06-25 23:33:46.414	2026-06-25 20:33:46.409542
450	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	14	t	\N	2026-06-25 23:33:46.414	2026-06-25 20:33:46.409542
451	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	43	t	\N	2026-06-25 23:34:46.413	2026-06-25 20:34:46.413808
452	TANK_BASINCI	Tank Basıncı	unknown	bar	11	t	\N	2026-06-25 23:34:46.414	2026-06-25 20:34:46.413808
453	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	33	t	\N	2026-06-25 23:34:46.415	2026-06-25 20:34:46.413808
454	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	12	t	\N	2026-06-25 23:34:46.415	2026-06-25 20:34:46.413808
455	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	52	t	\N	2026-06-25 23:34:46.416	2026-06-25 20:34:46.413808
456	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	43	t	\N	2026-06-25 23:35:46.417	2026-06-25 20:35:46.418082
457	TANK_BASINCI	Tank Basıncı	unknown	bar	11	t	\N	2026-06-25 23:35:46.419	2026-06-25 20:35:46.418082
458	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	33	t	\N	2026-06-25 23:35:46.419	2026-06-25 20:35:46.418082
459	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	12	t	\N	2026-06-25 23:35:46.419	2026-06-25 20:35:46.418082
460	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	52	t	\N	2026-06-25 23:35:46.42	2026-06-25 20:35:46.418082
461	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	43	t	\N	2026-06-25 23:36:46.419	2026-06-25 20:36:46.420664
462	TANK_BASINCI	Tank Basıncı	unknown	bar	11	t	\N	2026-06-25 23:36:46.42	2026-06-25 20:36:46.420664
463	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	33	t	\N	2026-06-25 23:36:46.421	2026-06-25 20:36:46.420664
464	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	12	t	\N	2026-06-25 23:36:46.421	2026-06-25 20:36:46.420664
465	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	52	t	\N	2026-06-25 23:36:46.422	2026-06-25 20:36:46.420664
466	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	43	t	\N	2026-06-26 00:25:05.377	2026-06-25 21:25:05.377387
467	TANK_BASINCI	Tank Basıncı	unknown	bar	11	t	\N	2026-06-26 00:25:05.38	2026-06-25 21:25:05.377387
468	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	33	t	\N	2026-06-26 00:25:05.381	2026-06-25 21:25:05.377387
469	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	12	t	\N	2026-06-26 00:25:05.381	2026-06-25 21:25:05.377387
470	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	52	t	\N	2026-06-26 00:25:05.382	2026-06-25 21:25:05.377387
471	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	43	t	\N	2026-06-26 00:26:05.405	2026-06-25 21:26:05.402038
472	TANK_BASINCI	Tank Basıncı	unknown	bar	11	t	\N	2026-06-26 00:26:05.415	2026-06-25 21:26:05.402038
473	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	33	t	\N	2026-06-26 00:26:05.417	2026-06-25 21:26:05.402038
474	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	12	t	\N	2026-06-26 00:26:05.418	2026-06-25 21:26:05.402038
475	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	52	t	\N	2026-06-26 00:26:05.423	2026-06-25 21:26:05.402038
476	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	43	t	\N	2026-06-26 00:27:05.395	2026-06-25 21:27:05.395831
477	TANK_BASINCI	Tank Basıncı	unknown	bar	11	t	\N	2026-06-26 00:27:05.398	2026-06-25 21:27:05.395831
478	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	33	t	\N	2026-06-26 00:27:05.399	2026-06-25 21:27:05.395831
479	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	12	t	\N	2026-06-26 00:27:05.4	2026-06-25 21:27:05.395831
480	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	52	t	\N	2026-06-26 00:27:05.401	2026-06-25 21:27:05.395831
481	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	43	t	\N	2026-06-26 00:28:05.404	2026-06-25 21:28:05.404107
482	TANK_BASINCI	Tank Basıncı	unknown	bar	11	t	\N	2026-06-26 00:28:05.407	2026-06-25 21:28:05.404107
483	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	33	t	\N	2026-06-26 00:28:05.408	2026-06-25 21:28:05.404107
484	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	12	t	\N	2026-06-26 00:28:05.41	2026-06-25 21:28:05.404107
485	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	52	t	\N	2026-06-26 00:28:05.412	2026-06-25 21:28:05.404107
486	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	43	t	\N	2026-06-26 00:34:05.737	2026-06-25 21:34:05.737576
487	TANK_BASINCI	Tank Basıncı	unknown	bar	11	t	\N	2026-06-26 00:34:05.739	2026-06-25 21:34:05.737576
488	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	33	t	\N	2026-06-26 00:34:05.739	2026-06-25 21:34:05.737576
489	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	12	t	\N	2026-06-26 00:34:05.74	2026-06-25 21:34:05.737576
490	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	52	t	\N	2026-06-26 00:34:05.741	2026-06-25 21:34:05.737576
491	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	43	t	\N	2026-06-26 00:35:05.755	2026-06-25 21:35:05.755584
492	TANK_BASINCI	Tank Basıncı	unknown	bar	11	t	\N	2026-06-26 00:35:05.757	2026-06-25 21:35:05.755584
493	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	33	t	\N	2026-06-26 00:35:05.757	2026-06-25 21:35:05.755584
494	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	12	t	\N	2026-06-26 00:35:05.758	2026-06-25 21:35:05.755584
495	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	52	t	\N	2026-06-26 00:35:05.758	2026-06-25 21:35:05.755584
496	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	43	t	\N	2026-06-26 00:36:05.768	2026-06-25 21:36:05.768487
497	TANK_BASINCI	Tank Basıncı	unknown	bar	11	t	\N	2026-06-26 00:36:05.769	2026-06-25 21:36:05.768487
498	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	33	t	\N	2026-06-26 00:36:05.77	2026-06-25 21:36:05.768487
499	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	12	t	\N	2026-06-26 00:36:05.771	2026-06-25 21:36:05.768487
500	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	52	t	\N	2026-06-26 00:36:05.772	2026-06-25 21:36:05.768487
501	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	43	t	\N	2026-06-26 00:37:05.769	2026-06-25 21:37:05.768708
502	TANK_BASINCI	Tank Basıncı	unknown	bar	11	t	\N	2026-06-26 00:37:05.772	2026-06-25 21:37:05.768708
503	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	33	t	\N	2026-06-26 00:37:05.772	2026-06-25 21:37:05.768708
504	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	12	t	\N	2026-06-26 00:37:05.773	2026-06-25 21:37:05.768708
505	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	52	t	\N	2026-06-26 00:37:05.774	2026-06-25 21:37:05.768708
506	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	43	t	\N	2026-06-26 00:46:01.484	2026-06-25 21:46:01.483134
507	TANK_BASINCI	Tank Basıncı	unknown	bar	11	t	\N	2026-06-26 00:46:01.486	2026-06-25 21:46:01.483134
508	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	33	t	\N	2026-06-26 00:46:01.489	2026-06-25 21:46:01.483134
509	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	12	t	\N	2026-06-26 00:46:01.49	2026-06-25 21:46:01.483134
510	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	52	t	\N	2026-06-26 00:46:01.493	2026-06-25 21:46:01.483134
511	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	43	t	\N	2026-06-26 00:47:01.499	2026-06-25 21:47:01.498097
512	TANK_BASINCI	Tank Basıncı	unknown	bar	11	t	\N	2026-06-26 00:47:01.503	2026-06-25 21:47:01.498097
513	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	33	t	\N	2026-06-26 00:47:01.504	2026-06-25 21:47:01.498097
514	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	12	t	\N	2026-06-26 00:47:01.505	2026-06-25 21:47:01.498097
515	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	52	t	\N	2026-06-26 00:47:01.507	2026-06-25 21:47:01.498097
516	TANK_SICAKLIGI	Tank Sıcaklığı	unknown	°C	43	t	\N	2026-06-26 00:58:19.451	2026-06-25 21:58:19.452379
517	TANK_BASINCI	Tank Basıncı	unknown	bar	11	t	\N	2026-06-26 00:58:19.455	2026-06-25 21:58:19.452379
518	TANK_SIVI_SEVIYESI	Tank Sıvı Seviyesi	unknown	%	33	t	\N	2026-06-26 00:58:19.457	2026-06-25 21:58:19.452379
519	ILETKENLIK_DEGERI	İletkenlik Değeri	unknown	µS/cm	12	t	\N	2026-06-26 00:58:19.462	2026-06-25 21:58:19.452379
520	WFI_SICAKLIGI	WFI Sıcaklığı	unknown	°C	52	t	\N	2026-06-26 00:58:19.467	2026-06-25 21:58:19.452379
\.


--
-- Data for Name: tag_readings_daily; Type: TABLE DATA; Schema: public; Owner: plcuser
--

COPY public.tag_readings_daily (id, tag_id, reading_date, min_value, max_value, avg_value, count_readings, created_at) FROM stdin;
\.


--
-- Name: production_cycles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: plcuser
--

SELECT pg_catalog.setval('public.production_cycles_id_seq', 8, true);


--
-- Name: system_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: plcuser
--

SELECT pg_catalog.setval('public.system_logs_id_seq', 66, true);


--
-- Name: tag_readings_daily_id_seq; Type: SEQUENCE SET; Schema: public; Owner: plcuser
--

SELECT pg_catalog.setval('public.tag_readings_daily_id_seq', 1, false);


--
-- Name: tag_readings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: plcuser
--

SELECT pg_catalog.setval('public.tag_readings_id_seq', 520, true);


--
-- Name: production_cycles production_cycles_pkey; Type: CONSTRAINT; Schema: public; Owner: plcuser
--

ALTER TABLE ONLY public.production_cycles
    ADD CONSTRAINT production_cycles_pkey PRIMARY KEY (id);


--
-- Name: system_logs system_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: plcuser
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_pkey PRIMARY KEY (id);


--
-- Name: tag_readings_daily tag_readings_daily_pkey; Type: CONSTRAINT; Schema: public; Owner: plcuser
--

ALTER TABLE ONLY public.tag_readings_daily
    ADD CONSTRAINT tag_readings_daily_pkey PRIMARY KEY (id);


--
-- Name: tag_readings_daily tag_readings_daily_tag_id_reading_date_key; Type: CONSTRAINT; Schema: public; Owner: plcuser
--

ALTER TABLE ONLY public.tag_readings_daily
    ADD CONSTRAINT tag_readings_daily_tag_id_reading_date_key UNIQUE (tag_id, reading_date);


--
-- Name: tag_readings tag_readings_pkey; Type: CONSTRAINT; Schema: public; Owner: plcuser
--

ALTER TABLE ONLY public.tag_readings
    ADD CONSTRAINT tag_readings_pkey PRIMARY KEY (id);


--
-- Name: idx_daily_reading_date; Type: INDEX; Schema: public; Owner: plcuser
--

CREATE INDEX idx_daily_reading_date ON public.tag_readings_daily USING btree (reading_date);


--
-- Name: idx_daily_tag_id; Type: INDEX; Schema: public; Owner: plcuser
--

CREATE INDEX idx_daily_tag_id ON public.tag_readings_daily USING btree (tag_id);


--
-- Name: idx_logs_created_at; Type: INDEX; Schema: public; Owner: plcuser
--

CREATE INDEX idx_logs_created_at ON public.system_logs USING btree (created_at);


--
-- Name: idx_logs_level; Type: INDEX; Schema: public; Owner: plcuser
--

CREATE INDEX idx_logs_level ON public.system_logs USING btree (level);


--
-- Name: idx_tag_readings_created_at; Type: INDEX; Schema: public; Owner: plcuser
--

CREATE INDEX idx_tag_readings_created_at ON public.tag_readings USING btree (created_at);


--
-- Name: idx_tag_readings_tag_id; Type: INDEX; Schema: public; Owner: plcuser
--

CREATE INDEX idx_tag_readings_tag_id ON public.tag_readings USING btree (tag_id);


--
-- Name: idx_tag_readings_timestamp; Type: INDEX; Schema: public; Owner: plcuser
--

CREATE INDEX idx_tag_readings_timestamp ON public.tag_readings USING btree (reading_timestamp);


--
-- PostgreSQL database dump complete
--

\unrestrict 6MaZ67Qsv2FBZe821wb4T5B5GMAnm189uNOaIYM7y7rFAfuQLq2GN0lOkTPCGGr

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

\restrict XsjULT6i16yeIp07injJs3njbpFAQ9JDNY5DOvkOKehw088PDwxMkgzRVZdIsmx

-- Dumped from database version 15.18
-- Dumped by pg_dump version 15.18

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\unrestrict XsjULT6i16yeIp07injJs3njbpFAQ9JDNY5DOvkOKehw088PDwxMkgzRVZdIsmx

--
-- PostgreSQL database cluster dump complete
--

