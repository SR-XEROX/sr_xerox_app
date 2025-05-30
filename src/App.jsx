// SR XEROX Price Calculator App
// Built with React, Tailwind CSS, and modern UI principles

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Printer, ClipboardX, Copy, Share2, FileDown, Moon } from "lucide-react";

const App = () => {
  const [settings, setSettings] = useState([
    { name: "A4 B/W", pagesPerSheet: 1, pricePerSheet: 1.0 },
    { name: "A3 Color", pagesPerSheet: 1, pricePerSheet: 10.0 },
  ]);

  const [customers, setCustomers] = useState([
    {
      name: "Customer 1",
      roundIndividual: false,
      roundTotal: false,
      discount: 0,
      tax: 0,
      items: [],
      showRoundingOptions: false,
    },
  ]);

  const [darkMode, setDarkMode] = useState(false);
  const [billHistory, setBillHistory] = useState([]);

  const updateCustomerItems = (customerIndex, items) => {
    const updated = [...customers];
    updated[customerIndex].items = items;
    setCustomers(updated);
  };

  const updateCustomer = (customerIndex, field, value) => {
    const updated = [...customers];
    updated[customerIndex][field] = value;
    setCustomers(updated);
  };

  const addCustomer = () => {
    setCustomers([
      ...customers,
      {
        name: `Customer ${customers.length + 1}`,
        roundIndividual: false,
        roundTotal: false,
        discount: 0,
        tax: 0,
        items: [],
        showRoundingOptions: false,
      },
    ]);
  };

  const deleteCustomer = (index) => {
    const updated = [...customers];
    updated.splice(index, 1);
    setCustomers(updated);
  };

  const clearCustomerItems = (customerIndex) => {
    const updated = [...customers];
    updated[customerIndex].items = [];
    setCustomers(updated);
  };

  const calculatePrice = (type, pages, sets = 1) => {
    const setting = settings.find((s) => s.name === type);
    if (!setting) return 0;
    const sheets = Math.ceil(pages / setting.pagesPerSheet);
    return setting.pricePerSheet * sheets * sets;
  };

  const roundUp = (num) => Math.ceil(num);

  const formatPrice = (price, round) => (round ? roundUp(price) : price.toFixed(2));

  const generateBillText = (customer) => {
    const itemsText = customer.items
      .map((item) => {
        const price = calculatePrice(item.type, item.pages, item.sets || 1);
        const formattedPrice = formatPrice(price, customer.roundIndividual);
        return `${item.name} (${item.type}, ${item.pages} pages, ${item.sets || 1} sets): ₹${formattedPrice}`;
      })
      .join("\n");

    let total = customer.items.reduce((acc, item) => acc + calculatePrice(item.type, item.pages, item.sets || 1), 0);
    total -= customer.discount || 0;
    total += (total * (customer.tax || 0)) / 100;
    const formattedTotal = formatPrice(total, customer.roundTotal);

    return `Customer: ${customer.name}\n\n${itemsText}\n\nDiscount: ₹${customer.discount || 0}\nTax: ${customer.tax || 0}%\nTotal: ₹${formattedTotal}`;
  };

  const downloadBillAsCSV = () => {
    const rows = [
      ["Customer", "Item", "Type", "Pages", "Sets", "Price"],
      ...customers.flatMap((customer) =>
        customer.items.map((item) => [
          customer.name,
          item.name,
          item.type,
          item.pages,
          item.sets,
          calculatePrice(item.type, item.pages, item.sets || 1),
        ])
      ),
    ];
    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sr_xerox_bill.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyBillToClipboard = (customerIndex) => {
    const billText = generateBillText(customers[customerIndex]);
    navigator.clipboard.writeText(billText)
      .then(() => alert("Bill copied to clipboard!"))
      .catch(() => alert("Failed to copy bill."));
  };

  const shareBill = async (customerIndex) => {
    const billText = generateBillText(customers[customerIndex]);
    try {
      if (navigator.share) {
        await navigator.share({ title: "SR XEROX Bill", text: billText });
      } else {
        alert("Sharing not supported on this device.");
      }
    } catch (error) {
      alert("Failed to share bill.");
    }
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-white to-gray-100"} p-6 min-h-screen`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">SR XEROX - Price Calculator</h1>
        <Button variant="outline" onClick={() => setDarkMode(!darkMode)}>
          <Moon className="h-4 w-4 mr-2" /> {darkMode ? "Light Mode" : "Dark Mode"}
        </Button>
      </div>
      <Tabs defaultValue="settings">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          {customers.map((c, i) => (
            <TabsTrigger key={i} value={`cust${i}`}>{c.name}</TabsTrigger>
          ))}
          <Button onClick={addCustomer} className="ml-2">
            <PlusCircle className="mr-1 h-4 w-4" /> Add Customer
          </Button>
        </TabsList>

        {/* Remaining UI unchanged */}

      </Tabs>
    </div>
  );
};

export default App;