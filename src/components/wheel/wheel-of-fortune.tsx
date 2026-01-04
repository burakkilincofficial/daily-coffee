"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Play } from "lucide-react";
import type { MemberWithDebts } from "@/types/coffee";

interface WheelOfFortuneProps {
  members: MemberWithDebts[];
}

export function WheelOfFortune({ members }: WheelOfFortuneProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberWithDebts | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [currentRotation, setCurrentRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const wheelRef = useRef<SVGSVGElement>(null);

  // Seçilen kişileri çarkıfelekten çıkar
  const availableMembers = members.filter(member => !selectedMemberIds.has(member.id));

  const colors = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
    "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1"
  ];

  const handleSpin = useCallback(() => {
    if (availableMembers.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setSelectedMember(null);

    // Her dilim 360 / availableMembers.length derece
    const sliceAngle = 360 / availableMembers.length;
    
    setShowResult(false);
    
    // Çarkı rastgele döndür (7-9 tur arası, daha dramatik)
    const minRotations = 7;
    const maxRotations = 9;
    const randomRotations = minRotations + Math.random() * (maxRotations - minRotations);
    const additionalRotation = Math.random() * 360; // Ekstra rastgele açı
    const targetRotation = currentRotation + (randomRotations * 360) + additionalRotation;
    
    setCurrentRotation(targetRotation);
    
    // Animasyonu tetiklemek için küçük bir gecikme
    requestAnimationFrame(() => {
      setRotation(targetRotation);
    });

    // Animasyon süresi: 2.5 saniye (hızlı)
    const animationDuration = 2500;

    // Animasyon bittikten sonra hangi dilimin üste geldiğini hesapla
    setTimeout(() => {
      // Çarkın mevcut rotation'ından hangi dilimin üste (yukarı, -90°) geldiğini bul
      // Başlangıçta ilk dilim -90°'de (yukarı) başlıyor
      // Çark rotation derece döndüğünde (CSS transform rotate pozitif = saat yönünün tersine)
      // Çark içindeki tüm içerik de çarkla birlikte döner
      // Başlangıçta -90°'deki dilim, çark döndükten sonra: -90° - rotation pozisyonunda
      
      // Normalize rotation (0-360 arası)
      const normalizedRotation = ((targetRotation % 360) + 360) % 360;
      
      // Başlangıçta üstteki nokta -90° (yukarı)
      // Çark rotation derece döndüğünde, üstteki nokta hala üstte (çünkü çark kendisi döner)
      // Ama çark içindeki içerik de döner, yani başlangıçta -90°'deki nokta artık başka pozisyonda
      // Üstteki nokta (-90°) artık çark içinde hangi açıda?
      // Çark rotation derece döndüğünde, çark içindeki -90° → (-90 - rotation) mod 360
      const angleAtTop = ((-90 - normalizedRotation + 720) % 360);
      
      // Bu açı hangi dilimin aralığında?
      // Her dilim i: [i * sliceAngle - 90, (i+1) * sliceAngle - 90] mod 360
      // angleAtTop'u normalize et: [0, 360)
      // -90 ekleyerek dilim indeksini bul
      const normalizedAngle = (angleAtTop + 90 + 360) % 360;
      let selectedIndex = Math.floor(normalizedAngle / sliceAngle);
      
      // Güvenlik kontrolü
      if (selectedIndex >= availableMembers.length) selectedIndex = availableMembers.length - 1;
      if (selectedIndex < 0) selectedIndex = 0;
      
      const selected = availableMembers[selectedIndex];
      
      // Seçilen kişiyi listeden çıkar
      setSelectedMemberIds(prev => new Set(prev).add(selected.id));
      
      setIsSpinning(false);
      
      // Sonucu animasyonlu göster
      setSelectedMember(selected);
      setTimeout(() => {
        setShowResult(true);
      }, 100);
    }, animationDuration);
  }, [availableMembers, isSpinning, currentRotation]);

  const handleReset = useCallback(() => {
    setRotation(0);
    setCurrentRotation(0);
    setSelectedMember(null);
    setShowResult(false);
    setSelectedMemberIds(new Set()); // Tüm seçilen kişileri temizle
    setIsSpinning(false);
  }, []);

  // CSS keyframes için style tag ekle
  useEffect(() => {
    const styleId = "wheel-animations";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes resultAppear {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          50% {
            transform: scale(1.05) translateY(-5px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (members.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🎰 Çarkıfelek</CardTitle>
          <CardDescription>Daily meeting için konuşmacı seçimi</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-8">
            Çarkıfelek için önce üye ekleyin.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sliceAngle = availableMembers.length > 0 ? 360 / availableMembers.length : 360;
  const radius = 150;
  const centerX = 200;
  const centerY = 200;

  // SVG path'leri oluştur
  const createSlicePath = (index: number) => {
    // Tek kişi kaldığında tam daire çiz (circle elementi kullan)
    if (availableMembers.length === 1) {
      // Circle elementi için ayrı bir case
      // Path ile: merkezden başlayıp tam daire
      const topY = centerY - radius;
      return `M ${centerX} ${centerY} L ${centerX} ${topY} A ${radius} ${radius} 0 1 1 ${centerX} ${centerY + radius} A ${radius} ${radius} 0 1 1 ${centerX} ${topY} Z`;
    }
    
    const startAngle = (index * sliceAngle - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * sliceAngle - 90) * (Math.PI / 180);
    
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArc = sliceAngle > 180 ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  // Text pozisyonları (merkezden dışarı doğru, diyagonallere paralel)
  const getTextPosition = (index: number) => {
    // Her dilimin merkez açısı (0° sağdan başlar, saat yönünde)
    const centerAngle = index * sliceAngle + sliceAngle / 2;
    // SVG'de açılar: 0° sağa, 90° aşağı (saat yönünde)
    // Başlangıç pozisyonu -90° (yukarı)
    const angleRad = (centerAngle - 90) * (Math.PI / 180);
    
    // İsimleri merkezden biraz dışarı yaz
    const textRadius = radius * 0.65;
    const x = centerX + textRadius * Math.cos(angleRad);
    const y = centerY + textRadius * Math.sin(angleRad);
    
    // İsimleri merkezden dışarı doğru çapraz yazmak için
    // Text rotation açısı, o noktanın merkezden açısına eşit olmalı
    // SVG'de 0° sağa, 90° aşağı, bu yüzden (centerAngle - 90) kullanıyoruz
    // Ama text'in okunabilmesi için, 90° ile 270° arası text'i ters çevirmeliyiz
    const rotation = centerAngle - 90;
    
    return { x, y, rotation };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>🎰 Çarkıfelek</CardTitle>
            <CardDescription>Daily meeting için konuşmacı seçimi</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Çark (solda) */}
          <div className="flex flex-col items-center">
            {availableMembers.length > 0 ? (
              <div className="relative">
                {/* Çark */}
                <svg
            ref={wheelRef}
            width="400"
            height="400"
            viewBox="0 0 400 400"
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: "center",
              transition: isSpinning 
                ? "transform 2.5s cubic-bezier(0.23, 1, 0.32, 1)" 
                : "transform 0.3s ease-out",
              pointerEvents: "none"
            }}
          >
            {/* Dilimler */}
            {availableMembers.map((member, index) => {
              const color = colors[index % colors.length];
              const textPos = getTextPosition(index);
              const displayName = member.name.length > 12 
                ? member.name.substring(0, 10) + "..." 
                : member.name;
              
              return (
                <g key={member.id}>
                  {availableMembers.length === 1 ? (
                    <circle
                      cx={centerX}
                      cy={centerY}
                      r={radius}
                      fill={color}
                      stroke="#fff"
                      strokeWidth="2"
                      className="transition-all duration-200 hover:opacity-80"
                    />
                  ) : (
                    <path
                      d={createSlicePath(index)}
                      fill={color}
                      stroke="#fff"
                      strokeWidth="2"
                      className="transition-all duration-200 hover:opacity-80"
                    />
                  )}
                  <text
                    x={textPos.x}
                    y={textPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="18"
                    transform={`rotate(${textPos.rotation} ${textPos.x} ${textPos.y})`}
                    className="pointer-events-none select-none"
                    style={{ 
                      textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
                      letterSpacing: "0.5px"
                    }}
                  >
                    {displayName}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* İşaret oku (aşağı doğru) */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 pointer-events-none"
            style={{ transform: "translateX(-50%) translateY(-8px)", zIndex: 1 }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              className="drop-shadow-lg"
            >
              <path
                d="M 20 40 L 10 20 L 20 25 L 30 20 Z"
                fill="#EF4444"
                stroke="#fff"
                strokeWidth="1.5"
              />
            </svg>
          </div>
              </div>
            ) : (
              <div className="w-full py-16 px-8 rounded-lg bg-muted/30 border border-border">
                <p className="text-center text-sm text-muted-foreground">
                  Tüm üyeler konuştu. Yeni tur için sıfırlayın.
                </p>
              </div>
            )}

            {/* Döndür butonu */}
            {availableMembers.length > 0 && (
              <Button
                onClick={handleSpin}
                disabled={isSpinning || availableMembers.length === 0}
                size="lg"
                className="relative z-10 w-full sm:w-auto min-w-[280px] px-8 py-4 mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg cursor-pointer"
              >
                <Play className="h-5 w-5 mr-2" />
                {isSpinning ? "Dönüyor..." : "Çarkıfeleği Döndür"}
              </Button>
            )}

            {/* Sıfırla butonu */}
            {availableMembers.length === 0 && (
              <Button
                onClick={handleReset}
                size="lg"
                variant="outline"
                className="w-full sm:w-auto min-w-[280px] px-8 py-4 mt-6"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Sıfırla
              </Button>
            )}

            {/* Seçilen üye - Animasyonlu */}
            {selectedMember && (
              <div
                className={`w-full mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800 transition-all duration-500 ${
                  showResult 
                    ? "opacity-100 scale-100 translate-y-0" 
                    : "opacity-0 scale-95 translate-y-4"
                }`}
                style={{
                  animation: showResult ? "resultAppear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none"
                }}
              >
                <p className="text-center text-sm font-medium text-muted-foreground mb-2">
                  🎯 Seçilen Konuşmacı
                </p>
                <p className="text-center text-2xl font-bold text-foreground">
                  {selectedMember.name}
                </p>
              </div>
            )}
          </div>

          {/* Konuşanlar (sağda) */}
          <div className="flex flex-col gap-4">
            {selectedMemberIds.size > 0 ? (
              <div className="w-full p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Konuşanlar ({selectedMemberIds.size})
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from(selectedMemberIds).map(memberId => {
                    const member = members.find(m => m.id === memberId);
                    return member ? (
                      <div
                        key={memberId}
                        className="inline-flex items-center px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium"
                      >
                        {member.name}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            ) : (
              <div className="w-full p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-muted-foreground text-center">
                  Henüz konuşan yok
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

