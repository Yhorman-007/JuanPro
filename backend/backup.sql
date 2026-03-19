--
-- PostgreSQL database dump
--

\restrict oNcNRAbFkKDdoyGO4ma2y6o3pzghgtrmzldo8B1OBcCQ9ypA7RsLYR1txabj8d1

-- Dumped from database version 17.8
-- Dumped by pg_dump version 17.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id integer,
    entity character varying(100) NOT NULL,
    entity_id integer NOT NULL,
    action character varying(50) NOT NULL,
    changes json,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id integer NOT NULL,
    name character varying NOT NULL,
    identification character varying,
    email character varying,
    phone character varying,
    address character varying,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- Name: product_supplier; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_supplier (
    product_id integer NOT NULL,
    supplier_id integer NOT NULL,
    cost_price_by_supplier double precision NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    sku character varying(100) NOT NULL,
    category character varying(100) NOT NULL,
    price_purchase double precision NOT NULL,
    price_sale double precision NOT NULL,
    unit character varying(50) NOT NULL,
    stock integer NOT NULL,
    min_stock integer NOT NULL,
    location character varying(255),
    expiration_date date,
    archived boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_order_items (
    id integer NOT NULL,
    purchase_order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    unit_cost double precision NOT NULL,
    received_quantity integer DEFAULT 0 NOT NULL
);


--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_order_items_id_seq OWNED BY public.purchase_order_items.id;


--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_orders (
    id integer NOT NULL,
    supplier_id integer NOT NULL,
    status character varying(50),
    total double precision NOT NULL,
    notes character varying(500),
    created_at timestamp with time zone DEFAULT now(),
    received_at timestamp with time zone,
    payment_method character varying(50) DEFAULT 'contado'::character varying,
    due_date timestamp with time zone,
    is_paid boolean DEFAULT false
);


--
-- Name: purchase_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_orders_id_seq OWNED BY public.purchase_orders.id;


--
-- Name: return_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.return_items (
    id integer NOT NULL,
    return_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL
);


--
-- Name: return_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.return_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: return_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.return_items_id_seq OWNED BY public.return_items.id;


--
-- Name: returns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.returns (
    id integer NOT NULL,
    sale_id integer NOT NULL,
    reason character varying NOT NULL,
    user_id integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: returns_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.returns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: returns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.returns_id_seq OWNED BY public.returns.id;


--
-- Name: sale_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sale_items (
    id integer NOT NULL,
    sale_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    unit_price double precision NOT NULL,
    subtotal double precision NOT NULL
);


--
-- Name: sale_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sale_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sale_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sale_items_id_seq OWNED BY public.sale_items.id;


--
-- Name: sales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales (
    id integer NOT NULL,
    total double precision NOT NULL,
    discount double precision,
    payment_method character varying(50) NOT NULL,
    tax_rate double precision,
    tax_amount double precision,
    user_id integer,
    created_at timestamp with time zone DEFAULT now(),
    client_id integer
);


--
-- Name: sales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sales_id_seq OWNED BY public.sales.id;


--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_movements (
    id integer NOT NULL,
    product_id integer NOT NULL,
    type character varying(50) NOT NULL,
    quantity integer NOT NULL,
    reason character varying(500),
    user_id integer,
    reference_type character varying(50),
    reference_id integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: stock_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_movements_id_seq OWNED BY public.stock_movements.id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suppliers (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    contact_name character varying(255),
    email character varying(255),
    phone character varying(50),
    payment_terms character varying(100),
    address character varying(500),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    hashed_password character varying(255) NOT NULL,
    full_name character varying(255),
    is_active boolean,
    role character varying(50),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: purchase_order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items ALTER COLUMN id SET DEFAULT nextval('public.purchase_order_items_id_seq'::regclass);


--
-- Name: purchase_orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders ALTER COLUMN id SET DEFAULT nextval('public.purchase_orders_id_seq'::regclass);


--
-- Name: return_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.return_items ALTER COLUMN id SET DEFAULT nextval('public.return_items_id_seq'::regclass);


--
-- Name: returns id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.returns ALTER COLUMN id SET DEFAULT nextval('public.returns_id_seq'::regclass);


--
-- Name: sale_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items ALTER COLUMN id SET DEFAULT nextval('public.sale_items_id_seq'::regclass);


--
-- Name: sales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales ALTER COLUMN id SET DEFAULT nextval('public.sales_id_seq'::regclass);


--
-- Name: stock_movements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements ALTER COLUMN id SET DEFAULT nextval('public.stock_movements_id_seq'::regclass);


--
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, user_id, entity, entity_id, action, changes, created_at) FROM stdin;
1	1	producto	1	crear	{"name": "Monitor gamer ", "sku": "TECH-MON-001", "category": "Tecnologia", "price_purchase": 2000000.0, "price_sale": 4300000.0, "unit": "Unidad", "stock": 12, "min_stock": 3, "location": "Almacen norte Ac", "expiration_date": null, "supplier_id": null}	2026-03-06 16:03:59.544783-05
2	1	producto	2	crear	{"name": "Pc AZUZ", "sku": "AZU-01", "category": "Tecnologia", "price_purchase": 1500000.0, "price_sale": 3200000.0, "unit": "Unidad", "stock": 10, "min_stock": 3, "location": "Pasillo 2, Estante B", "expiration_date": null, "supplier_id": null}	2026-03-06 16:28:03.539701-05
3	1	venta	1	crear	{"total": 43000000.0, "items_count": 1}	2026-03-06 17:24:25.911087-05
4	1	producto	3	crear	{"name": "Iphone 17 pro max", "sku": "IPH-17-PRM", "category": "Tecnologia", "price_purchase": 3800000.0, "price_sale": 5700000.0, "unit": "Unidad", "stock": 10, "min_stock": 3, "location": "Pasillo 2, Estante B", "expiration_date": null, "supplier_id": null}	2026-03-06 17:47:38.114335-05
5	1	producto	4	crear	{"name": "Televisor LG 98\\"", "sku": "TV-LG-98", "category": "Tecnologia", "price_purchase": 3750000.0, "price_sale": 5800000.0, "unit": "Unidad", "stock": 13, "min_stock": 4, "location": "Pasillo 54, Estante D", "expiration_date": null, "supplier_id": null}	2026-03-06 17:50:19.400891-05
6	1	orden_compra	1	crear	{"total": 37700000.0, "items_count": 2}	2026-03-06 18:04:44.734904-05
7	\N	proveedor	3	crear	{"name": "Logan Jose"}	2026-03-06 22:38:02.984456-05
8	\N	proveedor	3	actualizar	{"name": {"old": "Logan Jose", "new": "Logan Jose"}, "contact_name": {"old": "3052617865", "new": "3052617865"}, "email": {"old": "LoganJose@gmail.com", "new": "LoganJose@gmail.com"}, "phone": {"old": "3052617865", "new": "3052617865"}, "payment_terms": {"old": "5 cuotas", "new": "5 cuotas"}, "address": {"old": "Calle 42 SUR # 63 - 44\\nBarrio pradito - Unidad Aires del prado interiror 124", "new": "Calle 42 SUR # 63 - 44\\nBarrio pradito - Unidad Aires del prado interiror 124"}}	2026-03-06 22:38:17.211695-05
9	1	orden_compra	2	crear	{"total": 10000000.0, "items_count": 1, "name": "Yhorman Garc\\u00e9s Ballestas"}	2026-03-06 22:45:03.668469-05
10	1	orden_compra	2	recibir	null	2026-03-06 22:45:23.196773-05
11	1	producto	5	crear	{"name": "Huevo", "sku": "HKW-029", "category": "Alimentos", "price_purchase": 300.0, "price_sale": 1000.0, "unit": "Unidad", "stock": 40, "min_stock": 15, "location": "Mi Casa2", "expiration_date": null, "supplier_id": null}	2026-03-08 15:02:40.775587-05
12	\N	proveedor	4	crear	{"name": "Pepito meles"}	2026-03-08 15:04:20.243076-05
13	1	orden_compra	3	crear	{"total": 6000000.0, "items_count": 1, "name": "Yhorman Garc\\u00e9s Ballestas"}	2026-03-08 15:05:42.32052-05
14	1	orden_compra	4	crear	{"total": 6000000.0, "items_count": 1, "name": "Yhorman Garc\\u00e9s Ballestas"}	2026-03-08 15:06:12.88302-05
15	1	orden_compra	4	eliminar	null	2026-03-08 15:06:18.812265-05
16	1	orden_compra	3	recibir	null	2026-03-08 15:06:33.290836-05
17	1	orden_compra	3	eliminar	null	2026-03-08 15:06:43.567198-05
18	1	venta	2	crear	{"total": 17100000.0, "items_count": 1}	2026-03-08 15:09:23.243216-05
19	1	producto	5	actualizar	{"nombre_actual": "Huevo", "name": {"old": "Huevo", "new": "Huevo"}, "sku": {"old": "HKW-029", "new": "HKW-029"}, "category": {"old": "Alimentos", "new": "Alimentos"}, "price_purchase": {"old": 300.0, "new": 300.0}, "price_sale": {"old": 1000.0, "new": 1500.0}, "unit": {"old": "Unidad", "new": "Unidad"}, "min_stock": {"old": 15, "new": 15}, "location": {"old": "Mi Casa2", "new": "Mi Casa2"}, "expiration_date": {"old": null, "new": null}}	2026-03-08 15:23:01.79066-05
20	1	cliente	1	crear	{"name": "Juan Perez", "identification": ""}	2026-03-08 19:31:32.785459-05
21	1	cliente	2	crear	{"name": "Diego torres", "identification": "192"}	2026-03-08 19:34:54.695957-05
22	1	producto	5	actualizar	{"nombre_actual": "Huevo", "name": {"old": "Huevo", "new": "Huevo"}, "sku": {"old": "HKW-029", "new": "HKW-029"}, "category": {"old": "Alimentos", "new": "Alimentos"}, "price_purchase": {"old": 300.0, "new": 500.0}, "price_sale": {"old": 1500.0, "new": 1500.0}, "unit": {"old": "Unidad", "new": "Unidad"}, "min_stock": {"old": 15, "new": 15}, "location": {"old": "Mi Casa2", "new": "Mi Casa2"}, "expiration_date": {"old": null, "new": null}}	2026-03-08 19:48:57.856302-05
23	1	producto	2	actualizar	{"nombre_actual": "Pc AZUZ", "name": {"old": "Pc AZUZ", "new": "Pc AZUZ"}, "sku": {"old": "AZU-01", "new": "AZU-01"}, "category": {"old": "Tecnologia", "new": "Tecnologia"}, "price_purchase": {"old": 1500000.0, "new": 1400000.0}, "price_sale": {"old": 3200000.0, "new": 3200000.0}, "unit": {"old": "Unidad", "new": "Unidad"}, "min_stock": {"old": 3, "new": 3}, "location": {"old": "Pasillo 2, Estante B", "new": "Pasillo 2, Estante B"}, "expiration_date": {"old": null, "new": null}}	2026-03-08 19:53:51.586034-05
24	1	venta	3	crear	{"total": 6400000.0, "items_count": 1, "client_id": 2}	2026-03-09 11:29:13.022589-05
25	1	venta	4	crear	{"total": 8600000.0, "items_count": 1, "client_id": 1}	2026-03-11 09:58:14.004751-05
26	1	producto	6	crear	{"name": "Emanuel", "sku": "EMN-039", "category": "Persona", "price_purchase": 1500000.0, "price_sale": 3000000.0, "unit": "Unidad", "stock": 20, "min_stock": 3, "location": "Sena Calatrava", "expiration_date": null, "supplier_id": 1}	2026-03-11 10:05:48.231596-05
27	1	venta	5	crear	{"total": 5700000.0, "items_count": 1, "client_id": null}	2026-03-12 09:59:21.138002-05
28	1	producto	7	crear	{"name": "bisolbon", "sku": "BIS-456", "category": "farmac\\u00e9utico", "price_purchase": 15000.0, "price_sale": 16000.0, "unit": "23", "stock": 23, "min_stock": 2, "location": "Vitrina Central", "expiration_date": null, "supplier_id": 3}	2026-03-12 10:02:41.170087-05
29	1	venta	6	crear	{"total": 11400000.0, "items_count": 1, "client_id": 2}	2026-03-12 10:38:21.537097-05
30	1	producto	8	crear	{"name": "Cafe juan Valdez", "sku": "CAF-234", "category": "yusef", "price_purchase": 5000.0, "price_sale": 7000.0, "unit": "Unidad", "stock": 25, "min_stock": 10, "location": "Vitrina Central 2", "expiration_date": null, "supplier_id": 2}	2026-03-12 10:44:01.418621-05
31	1	venta	7	crear	{"total": 5700000.0, "items_count": 1, "client_id": null}	2026-03-15 23:29:14.24947-05
32	1	producto	9	crear	{"name": "Juan ", "sku": "JNS-007", "category": "Persona", "price_purchase": 1500000.0, "price_sale": 2000000.0, "unit": "Unidad", "stock": 20, "min_stock": 5, "location": "Sena Calatrava", "expiration_date": null, "supplier_id": null}	2026-03-16 11:51:49.76165-05
33	1	venta	8	crear	{"total": 11600000.0, "items_count": 1, "client_id": null}	2026-03-16 11:52:31.073988-05
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.clients (id, name, identification, email, phone, address, created_at) FROM stdin;
1	Juan Perez		corporativorm98@gmail.com	+573147421256	Calle 42 SUR # 63 - 44	2026-03-08 19:31:32.712097-05
2	Diego torres	192	Diegotorrez@gmail.com	392	Calle 65 #52d-174	2026-03-08 19:34:54.675435-05
\.


--
-- Data for Name: product_supplier; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_supplier (product_id, supplier_id, cost_price_by_supplier) FROM stdin;
1	1	2000000
4	2	3750000
3	2	3800000
2	3	1500000
5	4	300
6	1	1500000
7	3	15000
8	2	5000
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, name, sku, category, price_purchase, price_sale, unit, stock, min_stock, location, expiration_date, archived, created_at, updated_at) FROM stdin;
5	Huevo	HKW-029	Alimentos	500	1500	Unidad	40	15	Mi Casa2	\N	f	2026-03-08 15:02:40.775587-05	2026-03-08 19:48:57.856302-05
2	Pc AZUZ	AZU-01	Tecnologia	1400000	3200000	Unidad	8	3	Pasillo 2, Estante B	\N	f	2026-03-06 16:28:03.539701-05	2026-03-09 11:29:12.865257-05
1	Monitor gamer 	TECH-MON-001	Tecnologia	2000000	4300000	Unidad	8	3	Almacen norte Ac	\N	f	2026-03-06 16:03:59.544783-05	2026-03-11 09:58:13.870956-05
6	Emanuel	EMN-039	Persona	1500000	3000000	Unidad	20	3	Sena Calatrava	\N	f	2026-03-11 10:05:48.231596-05	\N
7	bisolbon	BIS-456	farmacéutico	15000	16000	23	23	2	Vitrina Central	\N	f	2026-03-12 10:02:41.170087-05	\N
8	Cafe juan Valdez	CAF-234	yusef	5000	7000	Unidad	25	10	Vitrina Central 2	\N	f	2026-03-12 10:44:01.418621-05	\N
3	Iphone 17 pro max	IPH-17-PRM	Tecnologia	3800000	5700000	Unidad	3	3	Pasillo 2, Estante B	\N	f	2026-03-06 17:47:38.114335-05	2026-03-15 23:29:14.168954-05
9	Juan 	JNS-007	Persona	1500000	2000000	Unidad	20	5	Sena Calatrava	\N	f	2026-03-16 11:51:49.76165-05	\N
4	Televisor LG 98"	TV-LG-98	Tecnologia	3750000	5800000	Unidad	11	4	Pasillo 54, Estante D	\N	f	2026-03-06 17:50:19.400891-05	2026-03-16 11:52:31.020332-05
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_order_items (id, purchase_order_id, product_id, quantity, unit_cost, received_quantity) FROM stdin;
1	1	4	6	3750000	0
2	1	3	4	3800000	0
3	2	1	5	2000000	0
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_orders (id, supplier_id, status, total, notes, created_at, received_at, payment_method, due_date, is_paid) FROM stdin;
1	2	pending	37700000	Para el jueves	2026-03-06 18:04:44.62414-05	\N	contado	\N	f
2	1	completado	10000000	\N	2026-03-06 22:45:03.584568-05	2026-03-06 22:45:23.156552-05	contado	\N	f
\.


--
-- Data for Name: return_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.return_items (id, return_id, product_id, quantity) FROM stdin;
\.


--
-- Data for Name: returns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.returns (id, sale_id, reason, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sale_items (id, sale_id, product_id, quantity, unit_price, subtotal) FROM stdin;
1	1	1	10	4300000	43000000
2	2	3	3	5700000	17100000
3	3	2	2	3200000	6400000
4	4	1	2	4300000	8600000
5	5	3	1	5700000	5700000
6	6	3	2	5700000	11400000
7	7	3	1	5700000	5700000
8	8	4	2	5800000	11600000
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales (id, total, discount, payment_method, tax_rate, tax_amount, user_id, created_at, client_id) FROM stdin;
1	43000000	0	Efectivo	0	0	\N	2026-03-06 17:24:25.701544-05	\N
2	17100000	0	Efectivo	0	0	\N	2026-03-08 15:09:23.217705-05	\N
3	6400000	0	Efectivo	0	0	\N	2026-03-09 11:29:12.865257-05	2
4	8600000	0	Efectivo	0	0	\N	2026-03-11 09:58:13.870956-05	1
5	5700000	0	Efectivo	0	0	\N	2026-03-12 09:59:20.948039-05	\N
6	11400000	0	Efectivo	0	0	\N	2026-03-12 10:38:21.447735-05	2
7	5700000	0	Efectivo	0	0	\N	2026-03-15 23:29:14.168954-05	\N
8	11600000	0	Efectivo	0	0	\N	2026-03-16 11:52:31.020332-05	\N
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_movements (id, product_id, type, quantity, reason, user_id, reference_type, reference_id, created_at) FROM stdin;
1	1	EXIT	10	Venta	\N	sale	1	2026-03-06 17:24:25.701544-05
2	3	IN	10	Stock inicial al crear producto 'Iphone 17 pro max'	1	product_create	3	2026-03-06 17:47:38.114335-05
3	4	IN	13	Stock inicial al crear producto 'Televisor LG 98"'	1	product_create	4	2026-03-06 17:50:19.400891-05
4	1	IN	5	Orden de compra #2 recibida	\N	purchase_order	2	2026-03-06 22:45:23.138963-05
5	5	IN	40	Stock inicial al crear producto 'Huevo'	1	product_create	5	2026-03-08 15:02:40.775587-05
6	1	IN	3	Orden de compra #3 recibida	\N	purchase_order	3	2026-03-08 15:06:33.261376-05
7	3	SALE	3	Venta	\N	sale	2	2026-03-08 15:09:23.217705-05
8	2	SALE	2	Venta	\N	sale	3	2026-03-09 11:29:12.865257-05
9	1	SALE	2	Venta	\N	sale	4	2026-03-11 09:58:13.870956-05
10	6	IN	20	Stock inicial al crear producto 'Emanuel'	1	product_create	6	2026-03-11 10:05:48.231596-05
11	3	SALE	1	Venta	\N	sale	5	2026-03-12 09:59:20.948039-05
12	7	IN	23	Stock inicial al crear producto 'bisolbon'	1	product_create	7	2026-03-12 10:02:41.170087-05
13	3	SALE	2	Venta	\N	sale	6	2026-03-12 10:38:21.447735-05
14	8	IN	25	Stock inicial al crear producto 'Cafe juan Valdez'	1	product_create	8	2026-03-12 10:44:01.418621-05
15	3	SALE	1	Venta	\N	sale	7	2026-03-15 23:29:14.168954-05
16	9	IN	20	Stock inicial al crear producto 'Juan '	1	product_create	9	2026-03-16 11:51:49.76165-05
17	4	SALE	2	Venta	\N	sale	8	2026-03-16 11:52:31.020332-05
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.suppliers (id, name, contact_name, email, phone, payment_terms, address, created_at, updated_at) FROM stdin;
1	Yhorman Garcés Ballestas	3042517612	yhormangarcesballestas@gmail.com	3042517612	Efectivo	Calle 65 #52d-174	2026-03-06 16:55:53.911108-05	\N
2	Wener Garces	3042517612	WenerGar4@gmail.com	3042517612	Credito	Calle 65 #52d-174	2026-03-06 17:52:53.597443-05	2026-03-06 17:53:19.133896-05
3	Logan Jose	3052617865	LoganJose@gmail.com	3052617865	5 cuotas	Calle 42 SUR # 63 - 44\nBarrio pradito - Unidad Aires del prado interiror 124	2026-03-06 22:38:02.960675-05	2026-03-06 22:38:17.199407-05
4	Pepito meles	3042516543	Pepito@gmail.com	3042516543	Efectivo	Calle 65 #52d-373	2026-03-08 15:04:20.227498-05	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, email, hashed_password, full_name, is_active, role, created_at) FROM stdin;
2	Wener2525	wener@gmail.com.com	$pbkdf2-sha256$29000$jRECoHSO0RoDIMQYw5gzxg$pG0Z95Jv0A.Dgtec7DiFVh//vgDfasJuCE2ymhcFJIQ	Wener eliett garces ballestas	t	CAJERO	2026-03-07 20:43:35.813192-05
3	Logan2525	Logan@gmail.com	$pbkdf2-sha256$29000$sbZWam2tlbKW8h5jDAGA0A$8wmDSwmrzKm5QOkS9YrkX.aBTB.yWyRUCCB2NwaBgqQ	Logan jose garces ballestas	t	CAJERO	2026-03-08 15:12:41.423974-05
1	Yhorman_Gar23	yhormangarcesballestas@gmail.com	$pbkdf2-sha256$29000$KcXY.9.7NwYgZCxlLIUwZg$u53mQ6nsil4jo9fXVWKTlrv1pXisvTMyBhVsKKIT508	Yhorman Garcia	t	ADMIN	2026-03-06 15:38:03.455278-05
4	yusef	Yusef@gmail.com	$pbkdf2-sha256$29000$7D1H6P2fs9baO0coJcSYsw$zuH5tSiOcwQTA.E5OzHea4XdoTxBbQW72ErWD8lFD9k	Yusef gonzales	t	CAJERO	2026-03-11 10:09:18.40234-05
5	Carlitos	Carlos867@gmail.com	$pbkdf2-sha256$29000$d.5dK0WoNcZ4T8nZG.Pcew$5Sydp6KdLW1asJBs0e8bC2sy0VlGDzL/r.y5tPmi0S0	Carlos velazques	t	CAJERO	2026-03-12 10:48:19.15468-05
6	Walver	123soportesp@gmail.com	$pbkdf2-sha256$29000$NMYYo5Sy1vqfc865l3LOOQ$eRgihiFNeiq0GM/wUYJnimLuUvooUfSn/rdgHhz7g9w	Walver Rodriguez	t	CAJERO	2026-03-12 10:50:00.468239-05
\.


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 33, true);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.clients_id_seq', 2, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 9, true);


--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchase_order_items_id_seq', 5, true);


--
-- Name: purchase_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchase_orders_id_seq', 4, true);


--
-- Name: return_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.return_items_id_seq', 1, false);


--
-- Name: returns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.returns_id_seq', 1, false);


--
-- Name: sale_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sale_items_id_seq', 8, true);


--
-- Name: sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sales_id_seq', 8, true);


--
-- Name: stock_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stock_movements_id_seq', 17, true);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 4, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: product_supplier product_supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_supplier
    ADD CONSTRAINT product_supplier_pkey PRIMARY KEY (product_id, supplier_id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: return_items return_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.return_items
    ADD CONSTRAINT return_items_pkey PRIMARY KEY (id);


--
-- Name: returns returns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_pkey PRIMARY KEY (id);


--
-- Name: sale_items sale_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_audit_logs_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_audit_logs_id ON public.audit_logs USING btree (id);


--
-- Name: ix_clients_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_clients_email ON public.clients USING btree (email);


--
-- Name: ix_clients_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_clients_id ON public.clients USING btree (id);


--
-- Name: ix_clients_identification; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_clients_identification ON public.clients USING btree (identification);


--
-- Name: ix_clients_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_clients_name ON public.clients USING btree (name);


--
-- Name: ix_products_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_products_id ON public.products USING btree (id);


--
-- Name: ix_products_sku; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_products_sku ON public.products USING btree (sku);


--
-- Name: ix_purchase_order_items_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_purchase_order_items_id ON public.purchase_order_items USING btree (id);


--
-- Name: ix_purchase_orders_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_purchase_orders_id ON public.purchase_orders USING btree (id);


--
-- Name: ix_return_items_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_return_items_id ON public.return_items USING btree (id);


--
-- Name: ix_returns_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_returns_id ON public.returns USING btree (id);


--
-- Name: ix_sale_items_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_sale_items_id ON public.sale_items USING btree (id);


--
-- Name: ix_sales_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_sales_id ON public.sales USING btree (id);


--
-- Name: ix_stock_movements_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_stock_movements_id ON public.stock_movements USING btree (id);


--
-- Name: ix_suppliers_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_suppliers_id ON public.suppliers USING btree (id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: ix_users_username; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_users_username ON public.users USING btree (username);


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: product_supplier product_supplier_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_supplier
    ADD CONSTRAINT product_supplier_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_supplier product_supplier_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_supplier
    ADD CONSTRAINT product_supplier_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE CASCADE;


--
-- Name: purchase_order_items purchase_order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: purchase_order_items purchase_order_items_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: return_items return_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.return_items
    ADD CONSTRAINT return_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: return_items return_items_return_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.return_items
    ADD CONSTRAINT return_items_return_id_fkey FOREIGN KEY (return_id) REFERENCES public.returns(id) ON DELETE CASCADE;


--
-- Name: returns returns_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id);


--
-- Name: returns returns_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: sale_items sale_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: sale_items sale_items_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;


--
-- Name: sales sales_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: sales sales_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: stock_movements stock_movements_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: stock_movements stock_movements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict oNcNRAbFkKDdoyGO4ma2y6o3pzghgtrmzldo8B1OBcCQ9ypA7RsLYR1txabj8d1

