<?php

namespace App\Livewire\Site;

use Livewire\Component;
use App\Models\Site;
use App\Services\AnalyticsService;
use Illuminate\Support\Facades\Log;
use Exception;

class TinybirdAnalytics extends Component
{
    public Site $site;
    public $analyticsData = [];
    public $loading = true;
    public $analyticsEnabled = false;
    public $dateFrom;
    public $dateTo;
    public $error = null;
    public $selectedMetric = 'visitors'; // Default metric for chart
    public $selectedDateRange = '7days'; // Default preset
    
    // Comparison functionality
    public $comparisonEnabled = false;
    public $comparisonType = 'previous'; // 'previous' or 'custom'
    public $comparisonDateFrom;
    public $comparisonDateTo;
    public $comparisonData = [];
    
    // Chart type
    public $chartType = 'line'; // 'line' or 'bar'

    public function mount(int $id): void
    {
        $this->site = Site::findOrFail($id);
        $this->authorize('view', $this->site);
        
        $subscription = $this->site->user->getSubscriptionPersonal();
        $this->analyticsEnabled = $subscription->isAnalyticsIncluded();
        
        // Set default date range (last 7 days)
        $this->setDateRangeFromPreset($this->selectedDateRange);
        
        if ($this->analyticsEnabled) {
            $this->loadAnalyticsData();
        } else {
            // Emit initial event even when analytics is disabled for proper UI initialization
            $this->dispatch('analyticsDataUpdated', [
                'chartData' => [],
                'comparisonData' => [],
                'analyticsData' => [],
                'selectedMetric' => $this->selectedMetric,
                'dateFrom' => $this->dateFrom,
                'dateTo' => $this->dateTo,
                'selectedDateRange' => $this->selectedDateRange,
                'comparisonEnabled' => $this->comparisonEnabled,
                'chartType' => $this->chartType
            ]);
        }
    }

    public function loadAnalyticsData()
    {
        $this->loading = true;
        $this->error = null;

        try {
            $analyticsService = app(AnalyticsService::class);
            
            // Fetch all dashboard data
            $this->analyticsData = [
                'kpis' => $analyticsService->getKpis($this->dateFrom, $this->dateTo),
                'topPages' => $analyticsService->getTopPages($this->dateFrom, $this->dateTo, 10),
                'topBrowsers' => $analyticsService->getTopBrowsers($this->dateFrom, $this->dateTo, 10),
                'topDevices' => $analyticsService->getTopDevices($this->dateFrom, $this->dateTo, 10),
                'topLocations' => $analyticsService->getTopLocations($this->dateFrom, $this->dateTo, 10),
                'topSources' => $analyticsService->getTopSources($this->dateFrom, $this->dateTo, 10),
            ];

            // Fetch comparison data if enabled
            if ($this->comparisonEnabled) {
                $this->loadComparisonData($analyticsService);
            }

            Log::info('Tinybird analytics loaded successfully', [
                'site_id' => $this->site->id,
                'site_url' => $this->site->url,
                'date_range' => [$this->dateFrom, $this->dateTo],
                'comparison_enabled' => $this->comparisonEnabled
            ]);

            // Emit events with the updated data for JavaScript
            $this->dispatch('analyticsDataUpdated', [
                'chartData' => $this->chartData,
                'comparisonData' => $this->comparisonChartData,
                'analyticsData' => $this->analyticsData,
                'selectedMetric' => $this->selectedMetric,
                'dateFrom' => $this->dateFrom,
                'dateTo' => $this->dateTo,
                'selectedDateRange' => $this->selectedDateRange,
                'comparisonEnabled' => $this->comparisonEnabled,
                'comparisonType' => $this->comparisonType,
                'chartType' => $this->chartType
            ]);

        } catch (Exception $e) {
            Log::error('Tinybird analytics error', [
                'message' => $e->getMessage(),
                'site_id' => $this->site->id,
                'site_url' => $this->site->url
            ]);

            $this->error = 'Unable to load analytics dashboard. Please try again later.';
        }

        $this->loading = false;
    }

    private function loadComparisonData($analyticsService)
    {
        // Calculate comparison date range
        $this->calculateComparisonDateRange();
        
        // Fetch comparison data
        $this->comparisonData = $analyticsService->getKpis($this->comparisonDateFrom, $this->comparisonDateTo);
    }

    private function calculateComparisonDateRange()
    {
        if ($this->comparisonType === 'previous') {
            // Calculate previous period of same length
            $startDate = \Carbon\Carbon::parse($this->dateFrom);
            $endDate = \Carbon\Carbon::parse($this->dateTo);
            $daysDiff = $startDate->diffInDays($endDate);
            
            $this->comparisonDateTo = $startDate->subDay()->format('Y-m-d');
            $this->comparisonDateFrom = $startDate->subDays($daysDiff)->format('Y-m-d');
        }
        // For custom comparison, dates are already set by the user
    }



    public function setChartType($type)
    {
        $this->chartType = $type;
        
        Log::info('Chart type changed', [
            'chartType' => $this->chartType,
            'selectedMetric' => $this->selectedMetric,
            'chartDataCount' => count($this->chartData),
            'comparisonEnabled' => $this->comparisonEnabled
        ]);
        
        // Emit event for frontend to update chart type with current state
        $this->dispatch('chartTypeChanged', [
            'chartType' => $this->chartType,
            'chartData' => $this->chartData,
            'comparisonData' => $this->comparisonChartData,
            'selectedMetric' => $this->selectedMetric,
            'comparisonEnabled' => $this->comparisonEnabled,
            'dateFrom' => $this->dateFrom,
            'dateTo' => $this->dateTo,
            'selectedDateRange' => $this->selectedDateRange
        ]);
    }

    public function updateDateRange()
    {
        $this->loadAnalyticsData();
    }

    public function updatedComparisonEnabled()
    {
        $this->loadAnalyticsData();
    }

    public function updatedComparisonType()
    {
        if ($this->comparisonEnabled) {
            $this->loadAnalyticsData();
        }
    }

    public function updatedComparisonDateFrom()
    {
        if ($this->comparisonEnabled && $this->comparisonType === 'custom') {
            $this->loadAnalyticsData();
        }
    }

    public function updatedComparisonDateTo()
    {
        if ($this->comparisonEnabled && $this->comparisonType === 'custom') {
            $this->loadAnalyticsData();
        }
    }

    public function setDateRangePreset($preset)
    {
        $this->selectedDateRange = $preset;
        $this->setDateRangeFromPreset($preset);
        $this->loadAnalyticsData();
    }

    private function setDateRangeFromPreset($preset)
    {
        switch ($preset) {
            case 'today':
                $this->dateFrom = now()->format('Y-m-d');
                $this->dateTo = now()->format('Y-m-d');
                break;
            case 'yesterday':
                $this->dateFrom = now()->subDay()->format('Y-m-d');
                $this->dateTo = now()->subDay()->format('Y-m-d');
                break;
            case '7days':
                $this->dateFrom = now()->subDays(6)->format('Y-m-d');
                $this->dateTo = now()->format('Y-m-d');
                break;
            case '30days':
                $this->dateFrom = now()->subDays(29)->format('Y-m-d');
                $this->dateTo = now()->format('Y-m-d');
                break;
            case '12months':
                $this->dateFrom = now()->subMonths(12)->format('Y-m-d');
                $this->dateTo = now()->format('Y-m-d');
                break;
        }
    }

    public function selectMetric($metric)
    {
        $this->selectedMetric = $metric;
        
        Log::info('Metric selected', [
            'metric' => $metric,
            'chartDataCount' => count($this->chartData),
            'analyticsDataKeys' => array_keys($this->analyticsData)
        ]);
        
        // Emit event for frontend to update chart with new metric
        $this->dispatch('analyticsDataUpdated', [
            'chartData' => $this->chartData,
            'comparisonData' => $this->comparisonChartData,
            'analyticsData' => $this->analyticsData,
            'selectedMetric' => $this->selectedMetric,
            'dateFrom' => $this->dateFrom,
            'dateTo' => $this->dateTo,
            'selectedDateRange' => $this->selectedDateRange,
            'comparisonEnabled' => $this->comparisonEnabled,
            'comparisonType' => $this->comparisonType,
            'chartType' => $this->chartType
        ]);
    }

    public function getChartDataProperty()
    {
        if (!isset($this->analyticsData['kpis']) || empty($this->analyticsData['kpis'])) {
            return [];
        }

        return collect($this->analyticsData['kpis'])->map(function ($item) {
            return [
                'date' => $item['date'] ?? '',
                'visitors' => $item['visits'] ?? 0,
                'pageviews' => $item['pageviews'] ?? 0,
                'visit_time' => $item['avg_session_sec'] ?? 0,
                'bounce_rate' => ($item['bounce_rate'] ?? 0) * 100,
            ];
        })->toArray();
    }

    public function getComparisonChartDataProperty()
    {
        if (!$this->comparisonEnabled || empty($this->comparisonData)) {
            return [];
        }

        return collect($this->comparisonData)->map(function ($item) {
            return [
                'date' => $item['date'] ?? '',
                'visitors' => $item['visits'] ?? 0,
                'pageviews' => $item['pageviews'] ?? 0,
                'visit_time' => $item['avg_session_sec'] ?? 0,
                'bounce_rate' => ($item['bounce_rate'] ?? 0) * 100,
            ];
        })->toArray();
    }

    public function render()
    {
        return view('livewire.site.tinybird-analytics', [
            'site' => $this->site,
            'analyticsData' => $this->analyticsData,
            'loading' => $this->loading,
            'error' => $this->error,
            'chartData' => $this->chartData,
            'comparisonData' => $this->comparisonChartData,
            'comparisonKpis' => $this->comparisonData, // Raw comparison KPI data for metric cards
            'selectedMetric' => $this->selectedMetric,
            'comparisonEnabled' => $this->comparisonEnabled,
            'comparisonType' => $this->comparisonType,
            'chartType' => $this->chartType
        ]);
    }
} 