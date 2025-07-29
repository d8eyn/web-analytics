<div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <!-- Tabs -->
        <div class="pt-6 sm:pt-4 pb-6">
            <livewire:site.partials.tabs :site="$site" selected="analytics" />
        </div>
        
        @if(!$analyticsEnabled)
            <div class="px-4 pt-2">
                <div class="mx-auto max-w-2xl text-center">
                    <p class="text-base/7 font-semibold text-purple-600">
                        Upgrade Needed
                    </p>

                    <h2 class="mt-2 text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
                        Analytics Dashboard
                    </h2>

                    <p class="mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
                        To access Analytics features, upgrade to one of our new analytics enabled plans and unlock real-time insights and advanced tools.
                    </p>

                    <p class="mt-6">
                        <a href="https://learn.urlmonitor.com/monitoring/our-new-monitoring-features" class="text-sm/6 font-semibold text-purple-600" target="_blank">
                            Learn more
                            <span aria-hidden="true">→</span>
                        </a>
                    </p>
                </div>
            </div>

            <div class="mb-20">
                <livewire:pricing.partials.pricing-table />
            </div>
        @else
            <div class="analytics-dashboard bg-white rounded-lg shadow-sm">
                <!-- Header -->
                <div class="dashboard-header border-b border-gray-200 px-6 py-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <h1 class="text-lg font-semibold text-gray-900">{{ $site->url }}</h1>
                            <div class="flex items-center space-x-4">
                                <div class="flex items-center text-sm text-gray-500">
                                    <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    <span>0 active visitors</span>
                                </div>
                                @if($comparisonEnabled ?? false)
                                    <div class="flex items-center text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                        </svg>
                                        <span>Comparing {{ ($comparisonType ?? 'previous') === 'previous' ? 'with previous period' : 'with custom period' }}</span>
                                    </div>
                                @endif
                            </div>
                        </div>
                        
                        <!-- Enhanced Date Range Picker -->
                        @php
                            $fallbackSelectedRange = $selectedDateRange ?? '7days';
                            $fallbackDateFrom = $dateFrom ?? now()->subDays(6)->format('Y-m-d');
                            $fallbackDateTo = $dateTo ?? now()->format('Y-m-d');
                        @endphp
                        
                        <div class="dashboard-controls flex items-center space-x-4">
                            <!-- Chart Type Toggle -->
                            <div class="flex items-center space-x-2">
                                <div class="flex bg-gray-100 rounded-lg p-1 border border-gray-100">
                                    <button wire:click="setChartType('line')" 
                                            class="flex items-center space-x-1 px-3 py-1 rounded-md text-sm {{ ($chartType ?? 'line') === 'line' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900' }}">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4"></path>
                                        </svg>
                                        <span>Line</span>
                                    </button>
                                    <button wire:click="setChartType('bar')" 
                                            class="flex items-center space-x-1 px-3 py-1 rounded-md text-sm {{ ($chartType ?? 'line') === 'bar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900' }}">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                        </svg>
                                        <span>Bar</span>
                                    </button>
                                </div>
                            </div>
                            
                            
                            
                            <!-- Date Range Controls -->
                            <div class="relative" 
                                 x-data="{
                                     showCalendar: false,
                                     showPresets: false,
                                     selectedRange: '',
                                     dateFrom: '',
                                     dateTo: '',
                                     
                                     fallbackSelectedRange: '{{ $fallbackSelectedRange }}',
                                     fallbackDateFrom: '{{ $fallbackDateFrom }}',
                                     fallbackDateTo: '{{ $fallbackDateTo }}',
                                     
                                     // Comparison state
                                     compareEnabled: false,
                                     comparisonType: '',
                                     comparisonDateFrom: '',
                                     comparisonDateTo: '',
                                     
                                     init() {
                                         // Use direct $wire property access (v3 best practice)
                                         this.selectedRange = this.$wire.selectedDateRange || this.fallbackSelectedRange;
                                         this.dateFrom = this.$wire.dateFrom || this.fallbackDateFrom;
                                         this.dateTo = this.$wire.dateTo || this.fallbackDateTo;
                                         this.compareEnabled = this.$wire.comparisonEnabled || false;
                                         this.comparisonType = this.$wire.comparisonType || 'previous';
                                         this.comparisonDateFrom = this.$wire.comparisonDateFrom || '';
                                         this.comparisonDateTo = this.$wire.comparisonDateTo || '';
                                     },
                                     
                                     get displayText() {
                                         try {
                                             const range = this.selectedRange || this.fallbackSelectedRange;
                                             if (!range) return '7 days';
                                             const ranges = {
                                                 'today': 'Today',
                                                 'yesterday': 'Yesterday', 
                                                 '7days': '7 days',
                                                 '30days': '30 days',
                                                 '12months': '12 months'
                                             };
                                             return ranges[range] || 'Custom';
                                         } catch (e) {
                                             console.error('getDisplayText error:', e);
                                             return '7 days';
                                         }
                                     },
                                     
                                     get dateRange() {
                                         try {
                                             const from = this.dateFrom || this.fallbackDateFrom;
                                             const to = this.dateTo || this.fallbackDateTo;
                                             
                                             if (!from || !to) return 'Loading...';
                                             if (from === to) {
                                                 return new Date(from).toLocaleDateString('en-US', { 
                                                     month: 'short', 
                                                     day: 'numeric', 
                                                     year: 'numeric' 
                                                 });
                                             }
                                             return new Date(from).toLocaleDateString('en-US', { 
                                                 month: 'short', 
                                                 day: 'numeric' 
                                             }) + ' - ' + new Date(to).toLocaleDateString('en-US', { 
                                                 month: 'short', 
                                                 day: 'numeric', 
                                                 year: 'numeric' 
                                             });
                                         } catch (e) {
                                             console.error('getDateRange error:', e);
                                             return 'Select dates';
                                         }
                                     }
                                 }">
                                
                                <!-- Date Range Display Button -->
                                <div class="flex items-center space-x-2">
                                    <button @click="showCalendar = !showCalendar" 
                                            class="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500">
                                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                        <span x-text="dateRange" class="text-gray-700"></span>
                                    </button>
                                    
                                    <div class="relative">
                                        <button @click="showPresets = !showPresets" 
                                                class="flex items-center space-x-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <span x-text="displayText"></span>
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </button>
                                        
                                        <!-- Preset Dropdown -->
                                        <div x-show="showPresets" 
                                             @click.away="showPresets = false"
                                             x-transition
                                             class="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                            <button @click="$wire.setDateRangePreset('today'); showPresets = false" 
                                                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Today</button>
                                            <button @click="$wire.setDateRangePreset('yesterday'); showPresets = false" 
                                                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Yesterday</button>
                                            <button @click="$wire.setDateRangePreset('7days'); showPresets = false" 
                                                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">7 days</button>
                                            <button @click="$wire.setDateRangePreset('30days'); showPresets = false" 
                                                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">30 days</button>
                                            <button @click="$wire.setDateRangePreset('12months'); showPresets = false" 
                                                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">12 months</button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Enhanced Calendar Modal with Comparison -->
                                <div x-show="showCalendar" 
                                     @click.away="showCalendar = false"
                                     x-transition
                                     class="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 w-96">
                                    <div class="space-y-4">
                                        <!-- Main Date Range -->
                                        <div>
                                            <h4 class="text-sm font-medium text-gray-900 mb-3">Date Range</h4>
                                            <div class="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label class="block text-xs font-medium text-gray-700 mb-1">From Date</label>
                                                    <input type="date" 
                                                           wire:model="dateFrom" 
                                                           class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500">
                                                </div>
                                                <div>
                                                    <label class="block text-xs font-medium text-gray-700 mb-1">To Date</label>
                                                    <input type="date" 
                                                           wire:model="dateTo" 
                                                           class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500">
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Comparison Section -->
                                        <div class="border-t border-gray-200 pt-4">
                                            <div class="flex items-center justify-between mb-3">
                                                <label class="flex items-center">
                                                    <input type="checkbox" 
                                                           x-model="compareEnabled"
                                                           wire:model="comparisonEnabled"
                                                           class="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-0">
                                                    <span class="ml-2 text-sm font-medium text-gray-900">Compare with</span>
                                                </label>
                                            </div>
                                            
                                            <div x-show="compareEnabled" x-transition class="space-y-3">
                                                <!-- Comparison Type Options -->
                                                <div class="flex space-x-4">
                                                    <label class="flex items-center">
                                                        <input type="radio" 
                                                               name="comparisonType" 
                                                               value="previous"
                                                               x-model="comparisonType"
                                                               wire:model="comparisonType"
                                                               class="text-purple-600 focus:ring-purple-500">
                                                        <span class="ml-2 text-sm text-gray-700">Previous period</span>
                                                    </label>
                                                    <label class="flex items-center">
                                                        <input type="radio" 
                                                               name="comparisonType" 
                                                               value="custom"
                                                               x-model="comparisonType"
                                                               wire:model="comparisonType"
                                                               class="text-purple-600 focus:ring-purple-500">
                                                        <span class="ml-2 text-sm text-gray-700">Custom dates</span>
                                                    </label>
                                                </div>
                                                
                                                <!-- Custom Comparison Dates -->
                                                <div x-show="comparisonType === 'custom'" x-transition class="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label class="block text-xs font-medium text-gray-700 mb-1">Compare From</label>
                                                        <input type="date" 
                                                               x-model="comparisonDateFrom"
                                                               wire:model="comparisonDateFrom"
                                                               class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500">
                                                    </div>
                                                    <div>
                                                        <label class="block text-xs font-medium text-gray-700 mb-1">Compare To</label>
                                                        <input type="date" 
                                                               x-model="comparisonDateTo"
                                                               wire:model="comparisonDateTo"
                                                               class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500">
                                                    </div>
                                                </div>
                                                
                                                <!-- Previous Period Info -->
                                                <div x-show="comparisonType === 'previous'" x-transition class="text-xs text-gray-500 bg-gray-50 rounded p-2">
                                                    Compares with the previous period of the same length
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Action Buttons -->
                                        <div class="flex justify-end space-x-2 pt-2">
                                            <button @click="showCalendar = false" 
                                                    class="px-3 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                                            <button wire:click="updateDateRange" 
                                                    @click="showCalendar = false"
                                                    class="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700">Apply</button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <!-- Navigation Tabs -->
                <div class="dashboard-nav border-b border-gray-200 px-6">
                    <nav class="flex space-x-8">
                        <a href="#" class="border-b-2 border-purple-500 py-4 px-1 text-sm font-medium text-purple-600 flex items-center">
                            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                            </svg>
                            Dashboard
                        </a>
                        <a href="#" class="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                            Funnels
                        </a>
                        <a href="#" class="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                            Sessions
                        </a>
                    </nav>
                </div>

                <!-- Content -->
                <div class="dashboard-content p-6">
                    @if($loading)
                        <div class="w-full h-64 flex items-center justify-center">
                            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        </div>
                    @elseif($error)
                        <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                                    </svg>
                                </div>
                                <div class="ml-3">
                                    <p class="text-sm text-red-700">{{ $error }}</p>
                                </div>
                            </div>
                        </div>
                    @else
                        <!-- KPI Cards - Now Clickable -->
                        <div class="metrics-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div class="metric-card cursor-pointer {{ ($selectedMetric ?? 'visitors') === 'visitors' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50' }} p-4 rounded-lg border transition-all duration-200 relative" 
                                 data-metric="visitors">
                                @if(($comparisonEnabled ?? false) && isset($comparisonKpis) && count($comparisonKpis) > 0)
                                    @php
                                        $currentVisits = collect($analyticsData['kpis'])->sum('visits');
                                        $comparisonVisits = collect($comparisonKpis)->sum('visits');
                                        $percentChange = $comparisonVisits > 0 ? (($currentVisits - $comparisonVisits) / $comparisonVisits) * 100 : 0;
                                    @endphp
                                    <div class="absolute top-2 right-2">
                                        <span class="px-2 py-1 rounded-full text-xs font-medium {{ $percentChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }}">
                                            {{ $percentChange >= 0 ? '+' : '' }}{{ number_format($percentChange, 1) }}%
                                        </span>
                                    </div>
                                @endif
                                <div class="metric-label text-sm text-gray-600 mb-1">Unique Visitors</div>
                                <div class="flex items-baseline space-x-2">
                                    <div class="metric-value text-2xl font-semibold text-gray-900">
                                        @if(isset($analyticsData['kpis']) && count($analyticsData['kpis']) > 0)
                                            {{ number_format(collect($analyticsData['kpis'])->sum('visits')) }}
                                        @else
                                            0
                                        @endif
                                    </div>
                                    @if(($comparisonEnabled ?? false) && isset($comparisonKpis) && count($comparisonKpis) > 0)
                                        <span class="text-sm text-gray-500">vs {{ number_format($comparisonVisits) }}</span>
                                    @endif
                                </div>
                            </div>
                            
                            <div class="metric-card cursor-pointer {{ ($selectedMetric ?? 'visitors') === 'pageviews' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50' }} p-4 rounded-lg border transition-all duration-200 relative"
                                 data-metric="pageviews">
                                @if(($comparisonEnabled ?? false) && isset($comparisonKpis) && count($comparisonKpis) > 0)
                                    @php
                                        $currentPageviews = collect($analyticsData['kpis'])->sum('pageviews');
                                        $comparisonPageviews = collect($comparisonKpis)->sum('pageviews');
                                        $percentChange = $comparisonPageviews > 0 ? (($currentPageviews - $comparisonPageviews) / $comparisonPageviews) * 100 : 0;
                                    @endphp
                                    <div class="absolute top-2 right-2">
                                        <span class="px-2 py-1 rounded-full text-xs font-medium {{ $percentChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }}">
                                            {{ $percentChange >= 0 ? '+' : '' }}{{ number_format($percentChange, 1) }}%
                                        </span>
                                    </div>
                                @endif
                                <div class="metric-label text-sm text-gray-600 mb-1">Site Pageviews</div>
                                <div class="flex items-baseline space-x-2">
                                    <div class="metric-value text-2xl font-semibold text-gray-900">
                                        @if(isset($analyticsData['kpis']) && count($analyticsData['kpis']) > 0)
                                            {{ number_format(collect($analyticsData['kpis'])->sum('pageviews')) }}
                                        @else
                                            0
                                        @endif
                                    </div>
                                    @if(($comparisonEnabled ?? false) && isset($comparisonKpis) && count($comparisonKpis) > 0)
                                        <span class="text-sm text-gray-500">vs {{ number_format($comparisonPageviews) }}</span>
                                    @endif
                                </div>
                            </div>
                            
                            <div class="metric-card cursor-pointer {{ ($selectedMetric ?? 'visitors') === 'visit_time' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50' }} p-4 rounded-lg border transition-all duration-200 relative"
                                 data-metric="visit_time">
                                @if(($comparisonEnabled ?? false) && isset($comparisonKpis) && count($comparisonKpis) > 0)
                                    @php
                                        $currentVisitTime = collect($analyticsData['kpis'])->avg('avg_session_sec') ?? 0;
                                        $comparisonVisitTime = collect($comparisonKpis)->avg('avg_session_sec') ?? 0;
                                        $percentChange = $comparisonVisitTime > 0 ? (($currentVisitTime - $comparisonVisitTime) / $comparisonVisitTime) * 100 : 0;
                                        
                                        $compMinutes = floor($comparisonVisitTime / 60);
                                        $compSeconds = floor($comparisonVisitTime % 60);
                                        $compFormattedTime = $compMinutes > 0 ? $compMinutes . 'm ' . $compSeconds . 's' : $compSeconds . 's';
                                    @endphp
                                    <div class="absolute top-2 right-2">
                                        <span class="px-2 py-1 rounded-full text-xs font-medium {{ $percentChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }}">
                                            {{ $percentChange >= 0 ? '+' : '' }}{{ number_format($percentChange, 1) }}%
                                        </span>
                                    </div>
                                @endif
                                <div class="metric-label text-sm text-gray-600 mb-1">Avg. Visit Time</div>
                                <div class="flex items-baseline space-x-2">
                                    <div class="metric-value text-2xl font-semibold text-gray-900">
                                        @if(isset($analyticsData['kpis']) && count($analyticsData['kpis']) > 0)
                                            @php
                                                $avgSession = collect($analyticsData['kpis'])->avg('avg_session_sec') ?? 0;
                                                $minutes = floor($avgSession / 60);
                                                $seconds = floor($avgSession % 60);
                                            @endphp
                                            {{ $minutes > 0 ? $minutes . 'm ' . $seconds . 's' : $seconds . 's' }}
                                        @else
                                            0s
                                        @endif
                                    </div>
                                    @if(($comparisonEnabled ?? false) && isset($comparisonKpis) && count($comparisonKpis) > 0)
                                        <span class="text-sm text-gray-500">vs {{ $compFormattedTime }}</span>
                                    @endif
                                </div>
                            </div>
                            
                            <div class="metric-card cursor-pointer {{ ($selectedMetric ?? 'visitors') === 'bounce_rate' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50' }} p-4 rounded-lg border transition-all duration-200 relative"
                                 data-metric="bounce_rate">
                                @if(($comparisonEnabled ?? false) && isset($comparisonKpis) && count($comparisonKpis) > 0)
                                    @php
                                        $currentBounceRate = collect($analyticsData['kpis'])->avg('bounce_rate') ?? 0;
                                        $comparisonBounceRate = collect($comparisonKpis)->avg('bounce_rate') ?? 0;
                                        $percentChange = $comparisonBounceRate > 0 ? (($currentBounceRate - $comparisonBounceRate) / $comparisonBounceRate) * 100 : 0;
                                    @endphp
                                    <div class="absolute top-2 right-2">
                                        <span class="px-2 py-1 rounded-full text-xs font-medium {{ $percentChange <= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }}">
                                            {{ $percentChange >= 0 ? '+' : '' }}{{ number_format($percentChange, 1) }}%
                                        </span>
                                    </div>
                                @endif
                                <div class="metric-label text-sm text-gray-600 mb-1">Bounce Rate</div>
                                <div class="flex items-baseline space-x-2">
                                    <div class="metric-value text-2xl font-semibold text-gray-900">
                                        @if(isset($analyticsData['kpis']) && count($analyticsData['kpis']) > 0)
                                            @php
                                                $bounceRate = collect($analyticsData['kpis'])->avg('bounce_rate') ?? 0;
                                            @endphp
                                            {{ number_format($bounceRate * 100, 1) }}%
                                        @else
                                            0%
                                        @endif
                                    </div>
                                    @if(($comparisonEnabled ?? false) && isset($comparisonKpis) && count($comparisonKpis) > 0)
                                        <span class="text-sm text-gray-500">vs {{ number_format($comparisonBounceRate * 100, 1) }}%</span>
                                    @endif
                                </div>
                            </div>
                        </div>

                        <!-- Chart Area -->
                        <div class="chart-section mb-8">
                            <div class="chart-container bg-gray-50 rounded-lg p-6" style="height: 300px;">
                                <div id="analytics-chart" class="w-full h-full"></div>
                            </div>
                        </div>

                        <!-- Data Tables -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <!-- Users in Last 30 Minutes (Real-time placeholder) -->
                            <div class="bg-white rounded-lg p-6 border border-gray-200 hidden">
                                <h3 class="text-sm font-medium text-gray-900 mb-4">USERS IN LAST 30 MINUTES</h3>
                                <div class="h-20 flex items-center justify-center">
                                    <div class="flex space-x-2">
                                        @for($i = 0; $i < 8; $i++)
                                            <div class="w-3 bg-green-400 rounded-sm" style="height: {{ rand(20, 60) }}px;"></div>
                                        @endfor
                                    </div>
                                </div>
                            </div>

                            <!-- Top Sources -->
                            <div class="bg-white rounded-lg p-6 border border-gray-200">
                                <h3 class="text-sm font-medium text-gray-900 mb-4">TOP SOURCES</h3>
                                <div class="space-y-1">
                                    <div class="flex items-center gap-4 py-2 text-xs font-medium text-gray-500 pb-2 border-b">
                                        <span class="flex-1">REFERRER</span>
                                        <span class="w-16 text-right">VISITS</span>
                                        <span class="w-16 text-right">HITS</span>
                                    </div>
                                    @if(isset($analyticsData['topSources']) && count($analyticsData['topSources']) > 0)
                                        @php
                                            $maxVisits = max(array_column($analyticsData['topSources'], 'visits'));
                                        @endphp
                                        @foreach(array_slice($analyticsData['topSources'], 0, 8) as $source)
                                            @php
                                                $barWidth = $maxVisits > 0 ? (($source['visits'] ?? 0) / $maxVisits) * 100 : 0;
                                            @endphp
                                            <div class="flex items-center gap-4 py-2">
                                                <!-- Bar chart with overlaid text -->
                                                <div class="flex-1 relative h-8">
                                                    <div class="w-full bg-gray-100 rounded h-8"></div>
                                                    <div class="absolute inset-0 bg-gradient-to-r to-purple-600/30 from-[#e1d8f7] rounded h-8" style="width: {{ $barWidth }}%"></div>
                                                    <div class="absolute inset-0 flex items-center">
                                                        <span class="text-sm font-medium text-gray-800 px-3 truncate">{{ $source['referrer'] }}</span>
                                                    </div>
                                                </div>
                                                <!-- Visits and Hits columns -->
                                                <div class="text-sm font-medium text-gray-900 w-16 text-right">{{ number_format($source['visits'] ?? 0) }}</div>
                                                <div class="text-sm font-medium text-gray-900 w-16 text-right">{{ number_format($source['hits'] ?? 0) }}</div>
                                            </div>
                                        @endforeach
                                    @else
                                        <div class="text-center text-gray-500 py-4">No data available</div>
                                    @endif
                                </div>
                            </div>
                       
                            <!-- Top Pages -->
                            <div class="bg-white rounded-lg p-6 border border-gray-200">
                                <h3 class="text-sm font-medium text-gray-900 mb-4">TOP PAGES</h3>
                                <div class="space-y-1">
                                    <div class="flex items-center gap-4 py-2 text-xs font-medium text-gray-500 pb-2 border-b">
                                        <span class="flex-1">PATHNAME</span>
                                        <span class="w-16 text-right">VISITS</span>
                                        <span class="w-16 text-right">HITS</span>
                                    </div>
                                    @if(isset($analyticsData['topPages']) && count($analyticsData['topPages']) > 0)
                                        @php
                                            $maxPageVisits = max(array_column($analyticsData['topPages'], 'visits'));
                                        @endphp
                                        @foreach(array_slice($analyticsData['topPages'], 0, 8) as $page)
                                            @php
                                                $barWidth = $maxPageVisits > 0 ? (($page['visits'] ?? 0) / $maxPageVisits) * 100 : 0;
                                            @endphp
                                            <div class="flex items-center gap-4 py-2">
                                                <!-- Bar chart with overlaid text -->
                                                <div class="flex-1 relative h-8">
                                                    <div class="w-full bg-gray-100 rounded h-8"></div>
                                                    <div class="absolute inset-0 bg-gradient-to-r to-purple-600/30 from-[#e1d8f7] rounded h-8" style="width: {{ $barWidth }}%"></div>
                                                    <div class="absolute inset-0 flex items-center">
                                                        <span class="text-sm font-medium text-gray-800 px-3 truncate">{{ $page['pathname'] ?? '/' }}</span>
                                                    </div>
                                                </div>
                                                <!-- Visits and Hits columns -->
                                                <div class="text-sm font-medium text-gray-900 w-16 text-right">{{ number_format($page['visits'] ?? 0) }}</div>
                                                <div class="text-sm font-medium text-gray-900 w-16 text-right">{{ number_format($page['hits'] ?? 0) }}</div>
                                            </div>
                                        @endforeach
                                    @else
                                        <div class="text-center text-gray-500 py-4 text-sm">No data available</div>
                                    @endif
                                </div>
                            </div>

                            <!-- Top Locations -->
                            <div class="bg-white rounded-lg p-6 border border-gray-200">
                                <h3 class="text-sm font-medium text-gray-900 mb-4">TOP LOCATIONS</h3>
                                <div class="space-y-1">
                                    <div class="flex items-center gap-4 py-2 text-xs font-medium text-gray-500 pb-2 border-b">
                                        <span class="flex-1">LOCATION</span>
                                        <span class="w-16 text-right">VISITS</span>
                                        <span class="w-16 text-right">HITS</span>
                                    </div>
                                    @if(isset($analyticsData['topLocations']) && count($analyticsData['topLocations']) > 0)
                                        @php
                                            $maxLocationVisits = max(array_column($analyticsData['topLocations'], 'visits'));
                                        @endphp
                                        @foreach(array_slice($analyticsData['topLocations'], 0, 8) as $location)
                                            @php
                                                $barWidth = $maxLocationVisits > 0 ? (($location['visits'] ?? 0) / $maxLocationVisits) * 100 : 0;
                                            @endphp
                                            <div class="flex items-center gap-4 py-2">
                                                <!-- Bar chart with overlaid text -->
                                                <div class="flex-1 relative h-8">
                                                    <div class="w-full bg-gray-100 rounded h-8"></div>
                                                    <div class="absolute inset-0 bg-gradient-to-r to-purple-600/30 from-[#e1d8f7] rounded h-8" style="width: {{ $barWidth }}%"></div>
                                                    <div class="absolute inset-0 flex items-center">
                                                        <span class="text-sm font-medium text-gray-800 px-3 truncate">{{ $location['location'] }}</span>
                                                    </div>
                                                </div>
                                                <!-- Visits and Hits columns -->
                                                <div class="text-sm font-medium text-gray-900 w-16 text-right">{{ number_format($location['visits'] ?? 0) }}</div>
                                                <div class="text-sm font-medium text-gray-900 w-16 text-right">{{ number_format($location['hits'] ?? 0) }}</div>
                                            </div>
                                        @endforeach
                                    @else
                                        <div class="text-center text-gray-500 py-4 text-sm">No data available</div>
                                    @endif
                                </div>
                            </div>

                            <!-- Top Devices -->
                            @include('livewire.site.partials.analytics-top-items', [
                                'title' => 'TOP DEVICES',
                                'data' => $analyticsData['topDevices'] ?? [],
                                'chartId' => 'devices-pie-chart',
                                'dataKey' => 'device',
                                'colors' => [
                                    'desktop' => 'bg-green-500', 
                                    'mobile-ios' => 'bg-red-500', 
                                    'mobile-android' => 'bg-yellow-500', 
                                    'bot' => 'bg-blue-500'
                                ],
                                'displayNames' => [
                                    'mobile-ios' => 'Mobile iOS',
                                    'mobile-android' => 'Mobile Android',
                                    'desktop' => 'Desktop',
                                    'bot' => 'Bot'
                                ]
                            ])

                            <!-- Top Browsers -->
                            @include('livewire.site.partials.analytics-top-items', [
                                'title' => 'TOP BROWSERS',
                                'data' => $analyticsData['topBrowsers'] ?? [],
                                'chartId' => 'browsers-pie-chart', 
                                'dataKey' => 'browser',
                                'colors' => [
                                    'chrome' => 'bg-green-500', 
                                    'safari' => 'bg-red-500', 
                                    'firefox' => 'bg-orange-500', 
                                    'edge' => 'bg-blue-500'
                                ],
                                'displayNames' => [
                                    'chrome' => 'Chrome',
                                    'safari' => 'Safari', 
                                    'firefox' => 'Firefox',
                                    'edge' => 'Edge'
                                ]
                            ])
                        </div>
                    @endif
                </div>
            </div>
        @endif
    </div>
</div>

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
<script>
// Global chart variables for resize handler access
let analyticsChart;
let devicesChart;
let browsersChart;

// Global chart data
let globalChartData = @json($chartData ?? []);
let globalComparisonData = @json($comparisonData ?? []);
let globalSelectedMetric = @json($selectedMetric ?? 'visitors');
let globalDateFrom = @json($dateFrom ?? '');
let globalDateTo = @json($dateTo ?? '');
let globalComparisonEnabled = @json($comparisonEnabled ?? false);
let globalChartType = @json($chartType ?? 'line');
let globalComparisonType = @json($comparisonType ?? 'previous');

// Generate series configuration for charts
function createSeriesConfig(name, data, chartType, isComparison = false) {
    const colors = isComparison ? {
        primary: '#94a3b8',
        secondary: '#cbd5e1',
        area: 'rgba(148, 163, 184, 0.2)',
        areaEnd: 'rgba(148, 163, 184, 0.02)',
        borderStart: '#94a3b8',
        borderEnd: 'rgba(148, 163, 184, 0.01)'
    } : {
        primary: '#8b5cf6',
        secondary: '#a855f7',
        area: 'rgba(139, 92, 246, 0.3)',
        areaEnd: 'rgba(139, 92, 246, 0.05)',
        borderStart: '#8b5cf6',
        borderEnd: 'rgba(139, 92, 246, 0.01)'
    };
    
    return {
        name: name,
        data: data,
        type: chartType,
        smooth: chartType === 'line' ? false : undefined,
        symbol: chartType === 'line' ? 'circle' : undefined,
        symbolSize: chartType === 'line' ? (isComparison ? 6 : 8) : undefined,
        barWidth: chartType === 'bar' ? '45%' : undefined,
        z: chartType === 'bar' ? (isComparison ? 3 : 2) : undefined,
        lineStyle: chartType === 'line' ? {
            color: colors.primary,
            width: 2,
            type: isComparison ? 'dashed' : 'solid'
        } : undefined,
        itemStyle: {
            color: chartType === 'bar' ? {
                type: 'linear',
                x: 0,
                y: isComparison ? 1 : 0,
                x2: 0,
                y2: isComparison ? 0 : 1,
                colorStops: [{
                    offset: 0, color: isComparison ? colors.primary : colors.area
                }, {
                    offset: 1, color: isComparison ? colors.secondary : colors.areaEnd
                }]
            } : colors.primary,
            borderColor: chartType === 'line' ? '#ffffff' : {
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                    offset: 0, color: colors.borderStart
                }, {
                    offset: 1, color: colors.borderEnd
                }]
            },
            borderWidth: 2,
            borderRadius: chartType === 'bar' ? [4, 4, 0, 0] : undefined,
            opacity: chartType === 'bar' && isComparison ? 0.8 : 1
        },
        areaStyle: chartType === 'line' ? {
            color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                    offset: 0, color: colors.area
                }, {
                    offset: 1, color: colors.areaEnd
                }]
            }
        } : undefined
    };
}

// Make updateMainChart global so it can be called from anywhere
function updateMainChart(data, metric, comparisonData = [], comparisonEnabled = false, chartType = 'line', forceRecreate = false, retryCount = 0) {
    const chartContainer = document.getElementById('analytics-chart');
    
    if (!chartContainer) {
        // Retry up to 10 times with increasing delays (for loading states)
        if (retryCount < 10) {
            setTimeout(() => {
                updateMainChart(data, metric, comparisonData, comparisonEnabled, chartType, forceRecreate, retryCount + 1);
            }, 100 + (retryCount * 100)); // 100ms, 200ms, 300ms, etc.
            return;
        }
        console.error('Chart container not found after all retries');
        return;
    }
    
    // Check if we can just update the existing chart instead of recreating
    // Allow efficient updates for both line and bar charts when just changing metrics
    // Now supports comparison mode thanks to enhanced updateChartSeries function
    const canUseEfficientUpdate = analyticsChart && 
                                 !forceRecreate && 
                                 data && data.length > 0;
    
    if (canUseEfficientUpdate) {
        return updateChartSeries(data, metric);
    }
    
    // Safely dispose of existing chart if we're recreating
    disposeChartSafely('analyticsChart', 'analytics-chart');
    
        // Validate container before initializing
    if (!chartContainer || chartContainer.offsetWidth === 0 || chartContainer.offsetHeight === 0) {

        // Retry if container exists but has no dimensions (loading transition)
        if (retryCount < 10) {
            setTimeout(() => {
                updateMainChart(data, metric, comparisonData, comparisonEnabled, chartType, forceRecreate, retryCount + 1);
            }, 100 + (retryCount * 100));
            return;
        }
        return;
    }
    
    try {
        // Double-check if there's already an instance on this container and dispose safely
        const existingInstance = echarts.getInstanceByDom(chartContainer);
        if (existingInstance) {
            try {
                existingInstance.dispose();
            } catch (disposeError) {
                console.warn('Error disposing existing chart instance:', disposeError);
                // Force clear the ECharts registry for this container
                try {
                    echarts.dispose(chartContainer);
                } catch (registryError) {
                    console.warn('Error clearing ECharts registry:', registryError);
                }
            }
        }
        
        // Clear container again before initializing
        chartContainer.innerHTML = '';
        
        analyticsChart = echarts.init(chartContainer);
    } catch (error) {
        console.error('Error initializing ECharts:', error);
        return;
    }
    
    // Handle empty data case
    if (!data || data.length === 0) {
        // If we're in a forced recreation (likely from date range change) and have no data,
        // retry a few times to wait for the new data to load
        if (forceRecreate && retryCount < 3) {
            setTimeout(() => {
                updateMainChart(globalChartData || [], metric, comparisonData, comparisonEnabled, chartType, forceRecreate, retryCount + 1);
            }, 200 + (retryCount * 100)); // 200ms, 300ms, 400ms delays
            return;
        }
        
        const option = {
            title: {
                text: 'No Data Available',
                textStyle: {
                    color: '#9ca3af',
                    fontSize: 14,
                    fontWeight: 'normal'
                },
                left: 'center',
                top: 'middle'
            },
            grid: {
                show: false
            }
        };
        try {
            analyticsChart.setOption(option);
        } catch (error) {
            console.error('Error setting chart option:', error);
        }
        return;
    }
        
        const labels = data.map(item => {
            const date = new Date(item.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        const values = data.map(item => {
            switch(metric) {
                case 'visitors': return item.visitors;
                case 'pageviews': return item.pageviews;
                case 'visit_time': return Math.round(item.visit_time);
                case 'bounce_rate': return Math.round(item.bounce_rate);
                default: return item.visitors;
            }
        });
        
        // Prepare comparison data if enabled
        let comparisonValues = [];
        let comparisonLabels = [];
        if (comparisonEnabled) {
            if (comparisonData && comparisonData.length > 0) {
                comparisonLabels = comparisonData.map(item => {
                    const date = new Date(item.date);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                });
                
                comparisonValues = comparisonData.map(item => {
                    switch(metric) {
                        case 'visitors': return item.visitors;
                        case 'pageviews': return item.pageviews;
                        case 'visit_time': return Math.round(item.visit_time);
                        case 'bounce_rate': return Math.round(item.bounce_rate);
                        default: return item.visitors;
                    }
                });
            } else {
                // If comparison is enabled but no data is available yet, retry after a delay
                console.log('Comparison enabled but no comparison data available, retrying...');
                if (retryCount < 5) {
                    setTimeout(() => {
                        updateMainChart(data, metric, comparisonData, comparisonEnabled, chartType, forceRecreate, retryCount + 1);
                    }, 200 + (retryCount * 100)); // Increasing delay: 200ms, 300ms, 400ms, etc.
                    return;
                } else {
                    console.warn('Comparison enabled but no comparison data after retries. Proceeding without comparison.');
                    // Continue without comparison data
                }
            }
        }
        
        const metricLabels = {
            'visitors': 'Visitors',
            'pageviews': 'Page Views', 
            'visit_time': 'Avg Visit Time (seconds)',
            'bounce_rate': 'Bounce Rate (%)'
        };
        
        const option = {
            legend: comparisonEnabled ? {
                data: ['Current Period', 'Comparison Period'],
                top: '5%',
                textStyle: {
                    color: '#6b7280',
                    fontSize: 12
                },
                selector: false // Hide selector buttons
            } : undefined,
            grid: {
                left: '0px',
                right: '32px',
                bottom: '0%',
                top: comparisonEnabled ? '15%' : '5%',
                containLabel: true
            },
            // Global bar configuration for proper spacing
            ...(chartType === 'bar' && comparisonEnabled ? {
                barCategoryGap: '20%',
                barGap: '2%'
            } : {}),
            xAxis: {
                type: 'category',
                data: labels,
                boundaryGap: chartType === 'bar' ? true : false,
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    color: '#9ca3af',
                    fontSize: 12,
                    margin: 10
                }
            },
            yAxis: {
                type: 'value',
                min: 0,
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    lineStyle: {
                        color: '#f3f4f6'
                    }
                },
                axisLabel: {
                    color: '#9ca3af',
                    fontSize: 12,
                    margin: 10,
                    formatter: function(value) {
                        if (metric === 'bounce_rate') {
                            return value + '%';
                        } else if (metric === 'visit_time') {
                            const minutes = Math.floor(value / 60);
                            return minutes > 0 ? `${minutes}m` : `${value}s`;
                        }
                        return new Intl.NumberFormat().format(value);
                    }
                }
            },
            series: (() => {
                const series = [];
                
                // Current period series
                const currentSeries = createSeriesConfig('Current Period', values, chartType, false);
                series.push(currentSeries);
                
                        // Comparison period series
        if (comparisonEnabled && comparisonValues.length > 0) {
            const comparisonSeries = createSeriesConfig('Comparison Period', comparisonValues, chartType, true);
            series.push(comparisonSeries);
        }
                
            return series;
            })(),
            tooltip: {
                trigger: 'axis',
                backgroundColor: '#1f2937',
                borderColor: '#374151',
                borderWidth: 1,
                textStyle: {
                    color: '#f9fafb'
                },
                formatter: function(params) {
                    if (!Array.isArray(params)) params = [params];
                    
                    const dataIndex = params[0].dataIndex;
                    const label = labels[dataIndex];
                    
                    let tooltipContent = `${label}<br/>`;
                    
                    params.forEach(param => {
                        let value = param.value;
                        let suffix = '';
                        
                        if (metric === 'visit_time') {
                            const minutes = Math.floor(value / 60);
                            const seconds = value % 60;
                            value = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
                        } else if (metric === 'bounce_rate') {
                            suffix = '%';
                        } else {
                            value = new Intl.NumberFormat().format(value);
                        }
                        
                        const seriesName = param.seriesName || metricLabels[metric];
                        const color = param.color;
                        tooltipContent += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>${seriesName}: ${value}${suffix}<br/>`;
                    });
                    
                    return tooltipContent;
                }
            }
        };
        
        try {
            analyticsChart.setOption(option, true); // true = replace all options
                                     // Force resize for chart type changes and complex charts
            setTimeout(() => {
                if (analyticsChart) {
                    try {
                        analyticsChart.resize();
                    } catch (resizeError) {
                        console.warn('Error resizing chart:', resizeError);
                    }
                }
            }, 30); // Short delay for proper rendering
        } catch (error) {
            console.error('Error setting main chart option:', error);
        }
    }

// Safe chart disposal function
function disposeChartSafely(chartVariableName, containerId) {
    let chart;
    
    // Get chart reference from global variables
    switch(chartVariableName) {
        case 'devicesChart':
            chart = devicesChart;
            break;
        case 'browsersChart':
            chart = browsersChart;
            break;
        case 'analyticsChart':
            chart = analyticsChart;
            break;
        default:
            console.warn('Unknown chart variable:', chartVariableName);
            return;
    }
    
    if (chart) {
        try {
            // Check if the container still exists and is attached to the DOM
            const container = document.getElementById(containerId);
            const isContainerValid = container && container.parentNode && document.body.contains(container);
            
            if (isContainerValid) {
                // Check if the chart instance is still valid
                const chartInstance = echarts.getInstanceByDom(container);
                if (chartInstance && chartInstance === chart) {
                    chart.dispose();
                }
            } else {
                // Container is gone, force dispose without DOM operations
                console.warn(`Container ${containerId} not found or detached, forcing chart cleanup`);
                if (chart._dom) {
                    chart._dom = null; // Clear DOM reference to prevent disposal errors
                }
            }
        } catch (error) {
            console.warn(`Error disposing ${chartVariableName}:`, error);
        } finally {
            // Always null out the chart reference
            switch(chartVariableName) {
                case 'devicesChart':
                    devicesChart = null;
                    break;
                case 'browsersChart':
                    browsersChart = null;
                    break;
                case 'analyticsChart':
                    analyticsChart = null;
                    break;
            }
        }
    }
}

// Safe pie chart reinitialization function
function reinitializePieCharts(analyticsData) {
    if (!analyticsData) return;
    
    const devicesData = analyticsData.topDevices || [];
    const browsersData = analyticsData.topBrowsers || [];
    
    // Re-create devices chart if data is available
    if (devicesData.length) {
        setTimeout(() => {
            disposeChartSafely('devicesChart', 'devices-pie-chart');
            devicesChart = createPieChart('devices-pie-chart', devicesData, 'device', 'visits', ['#10b981', '#ef4444', '#f59e0b', '#3b82f6']);
        }, 100); // Small delay to ensure DOM is stable
    }
    
    // Re-create browsers chart if data is available
    if (browsersData.length) {
        setTimeout(() => {
            disposeChartSafely('browsersChart', 'browsers-pie-chart');
            browsersChart = createPieChart('browsers-pie-chart', browsersData, 'browser', 'visits', ['#10b981', '#ef4444', '#f59e0b', '#3b82f6']);
        }, 150); // Slightly longer delay to avoid overlap
    }
}

// Make createPieChart global
function createPieChart(containerId, data, labelKey, valueKey, colors) {
    const container = document.getElementById(containerId);
    if (!container || !data.length) {
        console.warn(`Pie chart container ${containerId} not found or no data provided`);
        return null;
    }
    
    // Check if container is attached to DOM and has dimensions
    if (!document.body.contains(container) || container.offsetWidth === 0 || container.offsetHeight === 0) {
        console.warn(`Pie chart container ${containerId} not attached to DOM or has no dimensions`);
        return null;
    }
    
    // Check for existing chart instance and dispose safely
    const existingInstance = echarts.getInstanceByDom(container);
    if (existingInstance) {
        try {
            existingInstance.dispose();
        } catch (error) {
            console.warn(`Error disposing existing pie chart instance for ${containerId}:`, error);
        }
    }
    
    let chart;
    try {
        chart = echarts.init(container);
    } catch (error) {
        console.error(`Error initializing pie chart ${containerId}:`, error);
        return null;
    }
        
        const chartData = data.map((item, index) => ({
            name: item[labelKey],
            value: item[valueKey],
            itemStyle: {
                color: colors[index] || colors[index % colors.length] || '#8b5cf6'
            }
        }));
        
        const option = {
            series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['50%', '50%'],
                data: chartData,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                label: {
                    show: false
                },
                labelLine: {
                    show: false
                }
            }],
            tooltip: {
                trigger: 'item',
                backgroundColor: '#1f2937',
                borderColor: '#374151',
                borderWidth: 1,
                textStyle: {
                    color: '#f9fafb'
                },
                formatter: '{b}: {c} ({d}%)'
            }
        };
        
        try {
            chart.setOption(option);
        } catch (error) {
            console.error(`Error setting pie chart option for ${containerId}:`, error);
            return null;
        }
        
        return chart;
    }

// Efficiently update chart series without recreating the chart
function updateChartSeries(data, metric) {
    if (!analyticsChart) {
        console.error('No existing chart to update');
        return;
    }
    
    const labels = data.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const values = data.map(item => {
        switch(metric) {
            case 'visitors': return item.visitors;
            case 'pageviews': return item.pageviews;
            case 'visit_time': return Math.round(item.visit_time);
            case 'bounce_rate': return Math.round(item.bounce_rate);
            default: return item.visitors;
        }
    });
    
    const metricLabels = {
        'visitors': 'Visitors',
        'pageviews': 'Page Views', 
        'visit_time': 'Avg Visit Time (seconds)',
        'bounce_rate': 'Bounce Rate (%)'
    };
    
    // Build chart type-aware series configuration using shared function
    const seriesConfigs = [];
    
    // Main series configuration (using shared createSeriesConfig function)
    const mainSeriesConfig = createSeriesConfig('Current Period', values, globalChartType, false);
    seriesConfigs.push(mainSeriesConfig);
    
    // Add comparison series if comparison is enabled
    if (globalComparisonEnabled && globalComparisonData && globalComparisonData.length > 0) {
        
        // Calculate comparison values for the current metric
        const comparisonValues = globalComparisonData.map(item => {
            switch(metric) {
                case 'visitors': return item.visitors;
                case 'pageviews': return item.pageviews;
                case 'visit_time': return Math.round(item.visit_time);
                case 'bounce_rate': return Math.round(item.bounce_rate);
                default: return item.visitors;
            }
        });
        
        
        // Add main comparison series
        const comparisonSeriesConfig = createSeriesConfig('Comparison Period', comparisonValues, globalChartType, true);
        seriesConfigs.push(comparisonSeriesConfig);
    }
    
    // Update chart with chart-type appropriate configuration
    try {
        const updateOptions = {
            // Add legend if comparison is enabled
            legend: globalComparisonEnabled ? {
                data: ['Current Period', 'Comparison Period'],
                top: '5%',
                textStyle: {
                    color: '#6b7280',
                    fontSize: 12
                },
                selector: false
            } : undefined,
            // Update grid spacing for comparison mode
            grid: {
                left: '0px',
                right: '32px',
                bottom: '0%',
                top: globalComparisonEnabled ? '15%' : '5%',
                containLabel: true
            },
            // Add bar spacing configuration if needed
            ...(globalChartType === 'bar' && globalComparisonEnabled ? {
                barCategoryGap: '20%',
                barGap: '2%'
            } : {}),
            xAxis: {
                data: labels,
                boundaryGap: globalChartType === 'bar' ? true : false
            },
            yAxis: {
                axisLabel: {
                    formatter: function(value) {
                        if (metric === 'bounce_rate') {
                            return value + '%';
                        } else if (metric === 'visit_time') {
                            const minutes = Math.floor(value / 60);
                            return minutes > 0 ? `${minutes}m` : `${value}s`;
                        }
                        return new Intl.NumberFormat().format(value);
                    }
                }
            },
            series: seriesConfigs,
            tooltip: {
                trigger: 'axis',
                backgroundColor: '#1f2937',
                borderColor: '#374151',
                borderWidth: 1,
                textStyle: {
                    color: '#f9fafb'
                },
                formatter: function(params) {
                    if (!Array.isArray(params)) params = [params];
                    
                    const dataIndex = params[0].dataIndex;
                    const label = labels[dataIndex];
                    
                    let tooltipContent = `${label}<br/>`;
                    
                    params.forEach(param => {
                        let value = param.value;
                        let suffix = '';
                        
                        if (metric === 'visit_time') {
                            const minutes = Math.floor(value / 60);
                            const seconds = value % 60;
                            value = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
                        } else if (metric === 'bounce_rate') {
                            suffix = '%';
                        } else {
                            value = new Intl.NumberFormat().format(value);
                        }
                        
                        const seriesName = param.seriesName || metricLabels[metric];
                        const color = param.color;
                        tooltipContent += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>${seriesName}: ${value}${suffix}<br/>`;
                    });
                    
                    return tooltipContent;
                }
            }
        };
        
        analyticsChart.setOption(updateOptions, false); // false = don't merge, replace the specified options
        
    } catch (error) {
        // Fallback to full recreation if update fails
        updateMainChart(data, metric, [], false, globalChartType, true);
    }
}

// Global initialization function
function initializeAnalyticsChart() {
    const chartContainer = document.getElementById('analytics-chart');
    if (!chartContainer) {
        console.error('Analytics chart container not found during initialization');
        return;
    }
    
    updateMainChart(globalChartData, globalSelectedMetric, globalComparisonData, globalComparisonEnabled, globalChartType);
    
    // Set initial metric card selection
    setTimeout(() => {
        updateMetricCardSelection(globalSelectedMetric);
    }, 50); // Quick initial selection
}

// Pure JavaScript metric selection (no Livewire dependency)
function setupManualMetricSelection() {
    
    const metricCards = document.querySelectorAll('.metric-card');
    metricCards.forEach(card => {
        // Remove existing click listeners to avoid duplicates
        card.removeEventListener('click', handleManualMetricClick);
        
        // Add manual click listener
        card.addEventListener('click', handleManualMetricClick);
    });
}

function handleManualMetricClick(event) {
    const metric = event.currentTarget.getAttribute('data-metric');
    
    if (metric) {
        // For metric changes, just update the chart directly without refetching data
        // This prevents flickering and unnecessary network requests
        manualMetricUpdate(metric);
    }
}

function manualMetricUpdate(metric) {

    
    // Update global selected metric
    globalSelectedMetric = metric;
    
    // Update the chart directly with current data
    if (globalChartData && globalChartData.length > 0) {
        
        // Allow efficient updates even in comparison mode for metric changes
        // Only force recreation for major structural changes
        const shouldForceRecreate = false;
        
        updateMainChart(globalChartData, metric, globalComparisonData, globalComparisonEnabled, globalChartType, shouldForceRecreate);
        
        // Update UI selection - minimal delay only for recreations
        if (shouldForceRecreate) {
            setTimeout(() => {
                updateMetricCardSelection(metric);
            }, 40);
        } else {
            // Immediate update for efficient line chart updates
            updateMetricCardSelection(metric);
        }
    } else {
        console.warn('No chart data available for manual update');
    }
}

function updateMetricCardSelection(selectedMetric) {
    const metricCards = document.querySelectorAll('.metric-card');
    
    let selectedCardFound = false;
    metricCards.forEach((card) => {
        const cardMetric = card.getAttribute('data-metric');
        
        if (cardMetric) {
            // Remove existing selection classes
            card.classList.remove('ring-2', 'ring-purple-500', 'bg-purple-50');
            card.classList.add('hover:bg-gray-50');
            
            // Add selection classes if this is the selected metric
            if (cardMetric === selectedMetric) {
                card.classList.remove('hover:bg-gray-50');
                card.classList.add('ring-2', 'ring-purple-500', 'bg-purple-50');
                selectedCardFound = true;
            }
        }
    });
    
    if (!selectedCardFound && selectedMetric) {
        console.warn('No metric card found for selected metric:', selectedMetric);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    
    // Check if metric cards exist and are clickable
    const metricCards = document.querySelectorAll('.metric-card');

    // Setup metric selection event listeners
    setTimeout(() => {
        setupManualMetricSelection();
    }, 1000);
    
    // Initialize charts with error handling
    try {
        initializeAnalyticsChart();
    } catch (error) {
        console.error('Error initializing analytics chart:', error);
    }
    
    // Initialize pie charts for devices and browsers
    const devicesData = @json($analyticsData['topDevices'] ?? []);
    const browsersData = @json($analyticsData['topBrowsers'] ?? []);
    
    if (devicesData.length) {
        try {
                            try {
                    devicesChart = createPieChart('devices-pie-chart', devicesData, 'device', 'visits', ['#10b981', '#ef4444', '#f59e0b', '#3b82f6']);
                } catch (error) {
                    console.error('Error creating devices chart:', error);
                }
        } catch (error) {
            console.error('Error creating initial devices chart:', error);
        }
    }
    
    if (browsersData.length) {
        try {
                            try {
                    browsersChart = createPieChart('browsers-pie-chart', browsersData, 'browser', 'visits', ['#10b981', '#ef4444', '#f59e0b', '#3b82f6']);
                } catch (error) {
                    console.error('Error creating browsers chart:', error);
                }
        } catch (error) {
            console.error('Error creating initial browsers chart:', error);
        }
    }
    

});

// Listen for analytics data updates from Livewire
window.addEventListener('analyticsDataUpdated', function (event) {
    const eventData = event.detail[0] || event.detail;
    
    // Always try to update the chart, even with empty data
    if (eventData.selectedMetric !== undefined) {
        const hasNewData = JSON.stringify(eventData.chartData) !== JSON.stringify(globalChartData);
        const hasNewDateRange = eventData.dateFrom !== globalDateFrom || eventData.dateTo !== globalDateTo;
        
        // Store previous state for comparison
        const previousChartData = globalChartData;
        const previousSelectedMetric = globalSelectedMetric;
        const previousComparisonEnabled = globalComparisonEnabled;
        const previousComparisonType = globalComparisonType;
        const previousComparisonData = globalComparisonData;
        
        // Update global variables with new data
        globalChartData = eventData.chartData || [];
        globalComparisonData = eventData.comparisonData || [];
        globalSelectedMetric = eventData.selectedMetric;
        globalDateFrom = eventData.dateFrom;
        globalDateTo = eventData.dateTo;
        globalComparisonEnabled = eventData.comparisonEnabled || false;
        globalChartType = eventData.chartType || 'line';
        globalComparisonType = eventData.comparisonType || 'previous';
        
        // Check for various types of changes
        const metricChangedViaLivewire = previousSelectedMetric !== globalSelectedMetric;
        const comparisonStateChanged = previousComparisonEnabled !== globalComparisonEnabled;
        const comparisonTypeChanged = previousComparisonType !== globalComparisonType;
        const comparisonDataChanged = JSON.stringify(eventData.comparisonData) !== JSON.stringify(previousComparisonData);
        
        // Force recreation for significant changes
        const forceRecreate = hasNewData || hasNewDateRange || comparisonStateChanged || comparisonDataChanged || comparisonTypeChanged;
        
        // Determine if we need special handling with delays
        const needsDelayedUpdate = comparisonStateChanged || hasNewDateRange || 
                                 (comparisonDataChanged && globalComparisonEnabled) || 
                                 comparisonTypeChanged;
        
        if (needsDelayedUpdate) {
            let delayType, delay;
            
            if (comparisonTypeChanged) {
                delayType = 'comparison-type-change';
                delay = 300; // Longer delay for comparison type changes
            } else if (comparisonStateChanged) {
                delayType = 'comparison-toggle';
                delay = 100;
            } else if (hasNewDateRange) {
                delayType = 'date-change';
                delay = 150;
            } else {
                delayType = 'comparison-data';
                delay = 200;
            }
            
            console.log(`Delaying chart update for ${delayType} by ${delay}ms`);
            
            setTimeout(() => {
                // For comparison type changes, ensure we have data before proceeding
                if (comparisonTypeChanged && globalComparisonEnabled) {
                    // Check if comparison data is available, if not, retry a few times
                    let retryCount = 0;
                    const maxRetries = 5;
                    
                    const tryUpdate = () => {
                        if (globalComparisonData && globalComparisonData.length > 0) {
                            updateMainChart(globalChartData, globalSelectedMetric, globalComparisonData, globalComparisonEnabled, globalChartType, true);
                            setTimeout(() => {
                                updateMetricCardSelection(globalSelectedMetric);
                                // Re-initialize pie charts after comparison type change
                                reinitializePieCharts(eventData.analyticsData);
                            }, 50);
                        } else if (retryCount < maxRetries) {
                            retryCount++;
                            console.log(`Retrying comparison type change update (${retryCount}/${maxRetries})`);
                            setTimeout(tryUpdate, 100 * retryCount); // Increasing delay
                        } else {
                            console.warn('Comparison type change: proceeding without comparison data after retries');
                            updateMainChart(globalChartData, globalSelectedMetric, [], globalComparisonEnabled, globalChartType, true);
                            setTimeout(() => {
                                updateMetricCardSelection(globalSelectedMetric);
                                // Re-initialize pie charts after comparison type change
                                reinitializePieCharts(eventData.analyticsData);
                            }, 50);
                        }
                    };
                    
                    tryUpdate();
                } else {
                    updateMainChart(globalChartData, globalSelectedMetric, globalComparisonData, globalComparisonEnabled, globalChartType, true);
                    setTimeout(() => {
                        updateMetricCardSelection(globalSelectedMetric);
                        // Re-initialize pie charts for non-comparison-type changes
                        if (!comparisonTypeChanged) {
                            reinitializePieCharts(eventData.analyticsData);
                        }
                    }, 50);
                }
            }, delay);
        } else {
            updateMainChart(globalChartData, globalSelectedMetric, globalComparisonData, globalComparisonEnabled, globalChartType, forceRecreate);
        }
        
        // Ensure metric card selection is maintained after updates (unless handled by delayed path above)
        if (!needsDelayedUpdate) {
            if (forceRecreate) {
                // Only delay for recreations (data changes that aren't date range changes)
                setTimeout(() => {
                    updateMetricCardSelection(globalSelectedMetric);
                    // Re-initialize pie charts after forced recreation
                    if (eventData.analyticsData) {
                        reinitializePieCharts(eventData.analyticsData);
                    }
                }, 50);
            } else {
                // Immediate update for simple metric changes
                updateMetricCardSelection(globalSelectedMetric);
            }
        }
        
        // Re-initialize pie charts with new data - but only if not during comparison type changes
        if (eventData.analyticsData && !comparisonTypeChanged) {
            const devicesData = eventData.analyticsData.topDevices || [];
            const browsersData = eventData.analyticsData.topBrowsers || [];
            
            if (devicesData.length) {
                disposeChartSafely('devicesChart', 'devices-pie-chart');
                devicesChart = createPieChart('devices-pie-chart', devicesData, 'device', 'visits', ['#10b981', '#ef4444', '#f59e0b', '#3b82f6']);
            }
            
            if (browsersData.length) {
                disposeChartSafely('browsersChart', 'browsers-pie-chart');
                browsersChart = createPieChart('browsers-pie-chart', browsersData, 'browser', 'visits', ['#10b981', '#ef4444', '#f59e0b', '#3b82f6']);
            }
        }
    }
    // Try to force chart initialization after a delay
    setTimeout(() => {
        const chartContainer = document.getElementById('analytics-chart');
        if (chartContainer) {
            // Force a chart update if we have the container but no chart
            if (!analyticsChart && chartContainer.offsetWidth > 0) {
                updateMainChart(globalChartData || [], globalSelectedMetric || 'visitors', globalComparisonData || [], globalComparisonEnabled || false, globalChartType || 'line');
            }
        } else {
            // If container still doesn't exist, try the update anyway (with retry logic)
            updateMainChart(globalChartData || [], globalSelectedMetric || 'visitors', globalComparisonData || [], globalComparisonEnabled || false, globalChartType || 'line', true);
        }
    }, 500);
});

// Listen for chart type changes from Livewire
window.addEventListener('chartTypeChanged', function (event) {
    const eventData = event.detail[0] || event.detail;
    // Update global chart type
    globalChartType = eventData.chartType;
    
    // Robust chart recreation with proper cleanup and timing
    recreateChartWithNewType();
});




// Function to handle chart type changes with proper recreation
function recreateChartWithNewType() {
    // Preserve the current metric selection
    const preservedMetric = globalSelectedMetric;
    
    // Chart type changes ALWAYS require full recreation
    // Efficient updates don't work well for line <-> bar transitions
    
    disposeChartSafely('analyticsChart', 'analytics-chart');
    
    const chartContainer = document.getElementById('analytics-chart');
    if (chartContainer) {
        // Clear container to ensure clean state
        chartContainer.innerHTML = '';
    }
    
    // Short delay to ensure proper cleanup, then recreate
    setTimeout(() => {
        // Ensure the preserved metric is maintained
        globalSelectedMetric = preservedMetric;
        
        // Force recreation with new chart type
        updateMainChart(
            globalChartData,
            preservedMetric,
            globalComparisonData,
            globalComparisonEnabled,
            globalChartType,
            true // Force recreate
        );
        
        // Update UI selection after recreation
        setTimeout(() => {
            updateMetricCardSelection(preservedMetric);
        }, 50);
        
    }, 25); // Short but sufficient delay for cleanup
}

// Global resize handler for all charts with safety checks
window.addEventListener('resize', function() {
    try {
        if (analyticsChart && typeof analyticsChart.resize === 'function') {
            analyticsChart.resize();
        }
    } catch (error) {
        console.warn('Error resizing analytics chart:', error);
    }
    
    try {
        if (devicesChart && typeof devicesChart.resize === 'function') {
            devicesChart.resize();
        }
    } catch (error) {
        console.warn('Error resizing devices chart:', error);
    }
    
    try {
        if (browsersChart && typeof browsersChart.resize === 'function') {
            browsersChart.resize();
        }
    } catch (error) {
        console.warn('Error resizing browsers chart:', error);
    }
});

</script>
@endpush 