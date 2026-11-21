<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('padres', function (Blueprint $table) {
            $table->unsignedBigInteger('id_school')->nullable()->after('telefono');
            $table->foreign('id_school')->references('Id_school')->on('school')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('padres', function (Blueprint $table) {
            $table->dropForeign(['id_school']);
            $table->dropColumn('id_school');
        });
    }
};
